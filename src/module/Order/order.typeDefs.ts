export const OrderTypeDefs = `#graphql
  type Order {
    id: ID!
    orderNumber: String!
    customer: Customer!
    name: String!
    email: String!
    contactNumber: String!
    shippingAddress: String!
    district: String!
    city: String!
    zipCode: String!
    billingAddress: String
    shippingMethod: ShippingMethod!
    shippingCharge: Float!
    orderDate: String!
    deliveryDate: String
    orderStatus: OrderStatus!
    paymentStatus: PaymentStatus!
    paymentMethod: PaymentMethod!
    subtotal: Float!
    discountAmount: Float!
    taxAmount: Float!
    totalAmount: Float!
    orderItems: [OrderItem!]!
    payment: Payment
    trackingNumber: String
    notes: String
    deliveryNotes: String
    isDeleted: Boolean!
    isCancelled: Boolean!
    cancelReason: String
    couponCode: String
    couponDiscount: Float
    cancellationRequest: CancellationRequest
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    productId: String!
    variantId: String
    quantity: Int!
    unitPrice: Float!
    color: String
    size: String
    discount: Float
    subtotal: Float!
  }

  type Payment {
    id: ID!
    paymentMethod: PaymentMethod!
    transactionId: String
    amount: Float!
    paymentStatus: PaymentStatus!
    paymentDate: String
    paymentDetails: JSON
    refundAmount: Float
    refundReason: String
    refundTransactionId: String
    refundDate: String
  }

  type CancellationRequest {
    id: ID!
    reason: String!
    details: String
    status: CancellationStatus!
    vendorResponse: String
    requestedAt: String!
    respondedAt: String
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    contactNumber: String!
    address: String!
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
    RETURNED
    REFUNDED
  }

  enum PaymentStatus {
    UNPAID
    PAID
    PARTIALLY_PAID
    REFUNDED
    FAILED
  }

  enum PaymentMethod {
    CASH_ON_DELIVERY
    CREDIT_CARD
    DEBIT_CARD
    BKASH
    NAGAD
    ROCKET
    BANK_TRANSFER
    GIFT_CARD
  }

  enum CancellationStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum ShippingMethod {
    FREE_SHIPPING
    SUNDARBAN_COURIER
    REDX
  }



  type OrderListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Order]
  }

  type OrderResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Order
  }

  input CreateOrderInput {
    name: String!
    email: String!
    contactNumber: String!
    shippingAddress: String!
    district: String!
    city: String!
    zipCode: String!
    billingAddress: String
    shippingMethod: ShippingMethod!
    paymentMethod: PaymentMethod!
    notes: String
    deliveryNotes: String
    couponCode: String
    orderItems: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: String!
    variantId: String
    quantity: Int!
    color: String
    size: String
  }

  input UpdateOrderStatusInput {
    orderStatus: OrderStatus!
    trackingNumber: String
    notes: String
  }

  input CancellationRequestInput {
    reason: String!
    details: String
 
  }

  input CancellationResponseInput {
    response: String!
  }

  input OrderFilterInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: SortOrder
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    fromDate: String
    toDate: String
    searchTerm: String
  }

  type Query {
    getAllOrders(
      filters: OrderFilterInput   
    ): OrderListResponse!
    
    getSingleOrder(id: ID!): OrderResponse!
    
    getMyShopOrders(
      filters: OrderFilterInput
    ): OrderListResponse!
    
    getMyOrders(
      filters: OrderFilterInput
    ): OrderListResponse!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): OrderResponse!
    
    updateOrderStatus(
      id: ID!
      input: UpdateOrderStatusInput!
    ): OrderResponse!
    
    cancellationRequestByCustomer(
      orderId: ID!
      input: CancellationRequestInput!
    ): OrderResponse!
    
    approveCancellationRequest(
      cancellationId: ID!
      input: CancellationResponseInput
    ): OrderResponse!
    
    rejectCancellationRequest(
      cancellationId: ID!
      input: CancellationResponseInput!
    ): OrderResponse!
  }
`;
