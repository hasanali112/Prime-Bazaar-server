export const CouponTypeDefs = `#graphql
  type Coupon {
    id: ID!
    code: String!
    description: String
    discountType: DiscountType!
    discountValue: Float!
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    startDate: String!
    endDate: String!
    isActive: Boolean!
    usageLimit: Int
    usageCount: Int!
    createdAt: String!
    updatedAt: String!
    shop: Shop!
    products: [Product!]
  }

  type CouponListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Coupon]
  }

  type CouponResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Coupon
  }

  input CreateCouponInput {
    code: String!
    description: String
    discountType: DiscountType!
    discountValue: Float!
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    startDate: String!
    endDate: String!
    usageLimit: Int
  }

  input UpdateCouponInput {
    code: String
    description: String
    discountType: DiscountType
    discountValue: Float
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    startDate: String
    endDate: String
    isActive: Boolean
    usageLimit: Int
  }

  input CuponFilterInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: SortOrder
    shopId: ID
    searchTerm: String
  }

  type Query {
    getCoupons(
        filters:CuponFilterInput
    ): CouponListResponse!
    getCoupon(id: ID!): CouponResponse!
    getMyShopCoupons(
      page: Int
      limit: Int
      isActive: Boolean
    ): CouponListResponse!
  }

  type Mutation {
    createCoupon(input: CreateCouponInput!): CouponResponse!
    updateCoupon(id: ID!, input: UpdateCouponInput!): CouponResponse!
    deleteCoupon(id: ID!): CouponResponse!
    applyCouponToProduct(couponId: ID!, productId: ID!): ProductResponse!
    removeCouponFromProduct(productId: ID!): ProductResponse!
  }
`;
