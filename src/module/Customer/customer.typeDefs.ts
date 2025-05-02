export const CustomerTypeDefs = `#graphql
  type CustomerListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Customer]
  }

   
  type CustomerResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Customer
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    contactNumber: String!
    emergencyContactNumber: String!
    gender: String!
    profileImg: String!
    address: String!
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Customer {
    id: ID!
    userId: ID!
    name: String!
    email: String!
    contactNumber: String!
    emergencyContactNumber: String!
    gender: String!
    profileImg: String
    address: String!
    status: UserStatus!
    createdAt: String!
    updatedAt: String!
    user: User
    orders: [Order]
  }
  
  type Order {
    id: ID!
    orderNumber: String!
    customerId: ID!
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
    totalAmount: Float!
    orderItems: [OrderItem]
    payment: Payment
    trackingNumber: String
    notes: String
    deliveryNotes: String
    cancelReason: String
    couponCode: String
    couponDiscount: Float
    createdAt: String!
    updatedAt: String!
  }
  
  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    variantId: ID
    quantity: Int!
    unitPrice: Float!
    color: String
    size: String
    discount: Float
    subtotal: Float!
    createdAt: String!
    updatedAt: String!
  }
  
  type Payment {
    id: ID!
    orderId: ID!
    paymentMethod: PaymentMethod!
    transactionId: String
    amount: Float!
    paymentStatus: PaymentStatus!
    paymentDate: String
    refundAmount: Float
    refundReason: String
    refundTransactionId: String
    refundDate: String
    createdAt: String!
    updatedAt: String!
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
  
  enum ShippingMethod {
    FREE_SHIPPING
    SUNDARBAN_COURIER
    REDX
  }
  
  type Query {
    customers(page: Int, limit: Int, searchTerm: String): CustomerListResponse!
    getSingleCustomer(id: ID!): CustomerResponse!
 
  }
`;
