/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CancellationStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ShippingMethod,
  UserRole,
} from "@prisma/client";
import AppError from "../../error/AppError";

import {
  generateOrderNumber,
  generateTransactionNumber,
} from "./generateOrderNumberUtility";

export const orderMutationResolver = {
  createOrder: async (
    parent: any,
    {
      input,
    }: {
      input: {
        name: string;
        email: string;
        contactNumber: string;
        shippingAddress: string;
        district: string;
        city: string;
        zipCode: string;
        billingAddress?: string;
        shippingMethod: ShippingMethod;
        paymentMethod: PaymentMethod;
        notes?: string;
        deliveryNotes?: string;
        couponCode?: string;
        orderItems: {
          productId: string;
          variantId?: string;
          quantity: number;
          color?: string;
          size?: string;
          unitPrice: number;
          discount?: number;
          subtotal: number;
        }[];
        shippingCharge: number;
        subtotal: number;
        discountAmount: number;
        totalAmount: number;
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a customer
    if (userInfo.role !== UserRole.CUSTOMER) {
      throw new AppError("Only customers can create orders", "FORBIDDEN");
    }

    // Get customer
    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        customer: true,
      },
    });

    if (!user.customer) {
      throw new AppError("Customer profile not found", "NOT_FOUND");
    }

    // Generate Order Number
    const orderNumber = generateOrderNumber();
    const transactionNumber = generateTransactionNumber();

    // Basic validation for available stock and product status
    for (const item of input.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
        },
      });

      if (!product) {
        throw new AppError(
          `Product with ID ${item.productId} not found`,
          "NOT_FOUND"
        );
      }

      if (product.status !== "ACTIVE") {
        throw new AppError(
          `Product ${product.name} is not available`,
          "BAD_REQUEST"
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
          "BAD_REQUEST"
        );
      }

      // Validate variant if provided
      if (item.variantId) {
        const variant = product.variants.find(
          (v: any) => v.id === item.variantId
        );
        if (!variant) {
          throw new AppError(
            `Variant not found for product ${product.name}`,
            "NOT_FOUND"
          );
        }

        // Check if color is valid for this variant
        if (item.color && variant.color !== item.color) {
          throw new AppError(
            `Invalid color for the selected variant`,
            "BAD_REQUEST"
          );
        }

        // Check if size is valid for this variant
        if (item.size && !variant.sizes.includes(item.size)) {
          throw new AppError(
            `Invalid size for the selected variant`,
            "BAD_REQUEST"
          );
        }
      }
    }

    // Validate coupon if provided
    let coupon = null;
    if (input.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode },
      });

      if (!coupon) {
        throw new AppError("Invalid coupon code", "BAD_REQUEST");
      }

      const currentDate = new Date();
      if (
        !coupon.isActive ||
        currentDate < coupon.startDate ||
        currentDate > coupon.endDate ||
        (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
      ) {
        throw new AppError("Coupon is not valid or has expired", "BAD_REQUEST");
      }

      // Check minimum purchase amount if applicable
      if (
        coupon.minPurchaseAmount &&
        input.subtotal < coupon.minPurchaseAmount
      ) {
        throw new AppError(
          `Minimum purchase amount for this coupon is ${coupon.minPurchaseAmount}`,
          "BAD_REQUEST"
        );
      }
    }

    // Create order with transaction to ensure all database operations succeed or fail together
    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: user.customer.id,
            name: input.name,
            email: input.email,
            contactNumber: input.contactNumber,
            shippingAddress: input.shippingAddress,
            district: input.district,
            city: input.city,
            zipCode: input.zipCode,
            billingAddress: input.billingAddress,
            shippingMethod: input.shippingMethod,
            shippingCharge: input.shippingCharge,
            orderStatus: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
            paymentMethod: input.paymentMethod,
            subtotal: input.subtotal,
            discountAmount: input.discountAmount,
            totalAmount: input.totalAmount,
            notes: input.notes,
            deliveryNotes: input.deliveryNotes,
            couponCode: input.couponCode,
            couponDiscount: input.couponCode ? input.discountAmount : null,
          },
        });

        // Create order items
        for (const item of input.orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              color: item.color,
              size: item.size,
              discount: item.discount,
              subtotal: item.subtotal,
            },
          });
        }

        // Update product stock quantities
        for (const item of input.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Create payment record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            transactionId: transactionNumber,
            paymentMethod: input.paymentMethod,
            amount: input.totalAmount,
            paymentStatus: PaymentStatus.UNPAID,
          },
        });

        // Update coupon usage count if applicable
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              usageCount: {
                increment: 1,
              },
            },
          });
        }

        // Return the complete order with related data
        return tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            customer: true,
            orderItems: true,
            payment: true,
          },
        });
      }
    );

    return {
      statusCode: 201,
      success: true,
      message: "Order created successfully",
      data: order,
    };
  },

  cancellationRequestByCustomer: async (
    parent: any,
    {
      orderId,
      input,
    }: {
      orderId: string;
      input: {
        reason: string;
        details?: string;
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a customer
    if (userInfo.role !== UserRole.CUSTOMER) {
      throw new AppError(
        "Only customers can request cancellations",
        "FORBIDDEN"
      );
    }

    // Get order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        cancellationRequest: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found", "NOT_FOUND");
    }

    // Verify this is the customer's own order
    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        customer: true,
      },
    });

    if (order.customerId !== user.customer.id) {
      throw new AppError("You can only cancel your own orders", "FORBIDDEN");
    }

    // Check if order is eligible for cancellation
    if (
      order.orderStatus === OrderStatus.DELIVERED ||
      order.orderStatus === OrderStatus.CANCELLED ||
      order.orderStatus === OrderStatus.RETURNED ||
      order.orderStatus === OrderStatus.REFUNDED
    ) {
      throw new AppError(
        `Cannot request cancellation for an order in ${order.orderStatus} status`,
        "BAD_REQUEST"
      );
    }

    // Check if there's already a cancellation request
    if (order.cancellationRequest) {
      throw new AppError(
        "A cancellation request already exists for this order",
        "BAD_REQUEST"
      );
    }

    // Create cancellation request
    await prisma.cancellationRequest.create({
      data: {
        orderId: order.id,
        reason: input.reason,
        details: input.details,
        status: CancellationStatus.PENDING,
      },
    });

    // Get updated order with cancellation request
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: true,
        payment: true,
        cancellationRequest: true,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Cancellation request submitted successfully",
      data: updatedOrder,
    };
  },

  approveCancellationRequest: async (
    parent: any,
    {
      cancellationId,
      input,
    }: {
      cancellationId: string;
      input?: {
        response?: string;
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a vendor or admin
    if (userInfo.role !== UserRole.VENDOR && userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "Only vendors or admins can approve cancellation requests",
        "FORBIDDEN"
      );
    }

    // Get cancellation request
    const cancellationRequest = await prisma.cancellationRequest.findUnique({
      where: { id: cancellationId },
      include: {
        order: {
          include: {
            orderItems: true,
            payment: true,
          },
        },
      },
    });

    if (!cancellationRequest) {
      throw new AppError("Cancellation request not found", "NOT_FOUND");
    }

    // If user is vendor, verify they own the shop for the products in the order
    if (userInfo.role === UserRole.VENDOR) {
      // Get first product from order to check shop
      const firstOrderItem = cancellationRequest.order.orderItems[0];
      if (!firstOrderItem) {
        throw new AppError("No order items found", "NOT_FOUND");
      }

      const product = await prisma.product.findUnique({
        where: { id: firstOrderItem.productId },
        include: {
          shop: {
            include: {
              vendor: true,
            },
          },
        },
      });

      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      const user = await prisma.user.findUnique({
        where: { id: userInfo.userId },
        include: {
          vendor: true,
        },
      });

      if (user.vendor.id !== product.shop.vendor.id) {
        throw new AppError(
          "You can only handle cancellation requests for your own shop's orders",
          "FORBIDDEN"
        );
      }
    }

    // Check if cancellation request is still pending
    if (cancellationRequest.status !== CancellationStatus.PENDING) {
      throw new AppError(
        "This cancellation request has already been processed",
        "BAD_REQUEST"
      );
    }

    // Update cancellation request status
    await prisma.cancellationRequest.update({
      where: { id: cancellationId },
      data: {
        status: CancellationStatus.APPROVED,
        vendorResponse: input?.response || "Cancellation request approved",
        respondedAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: cancellationRequest.order.id },
      data: {
        orderStatus: OrderStatus.CANCELLED,
        isCancelled: true,
        cancelReason: cancellationRequest.reason,
      },
    });

    // Update payment status if there was a payment
    if (
      cancellationRequest.order.payment &&
      cancellationRequest.order.payment.paymentStatus === PaymentStatus.PAID
    ) {
      await prisma.payment.update({
        where: { orderId: cancellationRequest.order.id },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          refundAmount: cancellationRequest.order.payment.amount,
          refundReason: "Order cancellation approved",
          refundDate: new Date(),
        },
      });
    }

    // Restore product quantities
    for (const item of cancellationRequest.order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // Get updated order with cancellation request
    const updatedOrder = await prisma.order.findUnique({
      where: { id: cancellationRequest.order.id },
      include: {
        customer: true,
        orderItems: true,
        payment: true,
        cancellationRequest: true,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Cancellation request approved successfully",
      data: updatedOrder,
    };
  },

  rejectCancellationRequest: async (
    parent: any,
    {
      cancellationId,
      input,
    }: {
      cancellationId: string;
      input: {
        response: string;
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a vendor or admin
    if (userInfo.role !== UserRole.VENDOR && userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "Only vendors or admins can reject cancellation requests",
        "FORBIDDEN"
      );
    }

    // Get cancellation request
    const cancellationRequest = await prisma.cancellationRequest.findUnique({
      where: { id: cancellationId },
      include: {
        order: {
          include: {
            orderItems: true,
            payment: true,
          },
        },
      },
    });

    if (!cancellationRequest) {
      throw new AppError("Cancellation request not found", "NOT_FOUND");
    }

    // If user is vendor, verify they own the shop for the products in the order
    if (userInfo.role === UserRole.VENDOR) {
      // Get first product from order to check shop
      const firstOrderItem = cancellationRequest.order.orderItems[0];
      if (!firstOrderItem) {
        throw new AppError("No order items found", "NOT_FOUND");
      }

      const product = await prisma.product.findUnique({
        where: { id: firstOrderItem.productId },
        include: {
          shop: {
            include: {
              vendor: true,
            },
          },
        },
      });

      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      const user = await prisma.user.findUnique({
        where: { id: userInfo.userId },
        include: {
          vendor: true,
        },
      });

      if (user.vendor.id !== product.shop.vendor.id) {
        throw new AppError(
          "You can only handle cancellation requests for your own shop's orders",
          "FORBIDDEN"
        );
      }
    }

    // Check if cancellation request is still pending
    if (cancellationRequest.status !== CancellationStatus.PENDING) {
      throw new AppError(
        "This cancellation request has already been processed",
        "BAD_REQUEST"
      );
    }

    // Require a response reason
    if (!input.response) {
      throw new AppError(
        "You must provide a reason for rejecting the request",
        "BAD_REQUEST"
      );
    }

    // Update cancellation request status
    await prisma.cancellationRequest.update({
      where: { id: cancellationId },
      data: {
        status: CancellationStatus.REJECTED,
        vendorResponse: input.response,
        respondedAt: new Date(),
      },
    });

    // Get updated order with cancellation request
    const updatedOrder = await prisma.order.findUnique({
      where: { id: cancellationRequest.order.id },
      include: {
        customer: true,
        orderItems: true,
        payment: true,
        cancellationRequest: true,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Cancellation request rejected",
      data: updatedOrder,
    };
  },
};
