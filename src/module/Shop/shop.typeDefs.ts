// shop.typeDefs.ts
export const ShopTypeDefs = `#graphql
  type Shop {
    id: ID!
    name: String!
    logo: String
    description: String
    email: String!
    contactNumber: String!
    status: ShopStatus!
    isVerified: Boolean!
    isDeleted: Boolean!
    isTemporaryDelete: Boolean!
    createdAt: String!
    updatedAt: String!
    vendor: Vendor
    products: [Product]
  }


  type Product {
    id: ID!
    sku: String!
    name: String!
    description: String
    price: Float!
    stockQuantity: Int!
    discountPercent: Float
    brand: String!
    isFlashSale: Boolean
    flashSaleEndTime: String
    shippingMethods: ShippingMethod!
    shippingCharge: Float
    status: ProductStatus!
    createdAt: String!
    updatedAt: String!
    variants: [Variant]
    itemCategory: ItemCategory
    coupon: Coupon
  }

  type Variant {
    id: ID!
    color: String
    images: [String]
    sizes: [String]
    productId: String!
    createdAt: String!
    updatedAt: String!
  }

  type ItemCategory {
    id: ID!
    name: String!
    description: String
    subCategory: SubCategory!
  }

  type SubCategory {
    id: ID!
    name: String!
    description: String
    mainCategory: MainCategory!
  }

  type MainCategory {
    id: ID!
    name: String!
    description: String
  }

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
  }

  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
  }

  enum ShippingMethod {
    FREE_SHIPPING
    SUNDARBAN_COURIER
    REDX
  }

  enum ProductStatus {
    ACTIVE
    INACTIVE
    DELETED
  }


  type ShopListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Shop]
  }

  type ShopResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Shop
  }

  input CreateShopInput {
    name: String!
    logo: Upload!
    description: String
    email: String!
    contactNumber: String!
  }

  input UpdateShopInput {
    name: String
    logo: Upload
    description: String
    email: String
    contactNumber: String
    isDeleted: Boolean
    isTemporaryDelete: Boolean
  }

  enum ShopStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    DELETED
  }

  type Query {
    getAllShops(
      page: Int
      limit: Int
      status: ShopStatus
      searchTerm: String
    ): ShopListResponse!
    getShop(id: ID!): ShopResponse!
    getMyShop: ShopResponse!
  }

  type Mutation {
    createShop(input: CreateShopInput!): ShopResponse!
    updateShop(id: ID!, input: UpdateShopInput!): ShopResponse!
    deleteShop(id: ID!): ShopResponse!
    temporaryDeleteShop(id: ID!): ShopResponse!
    restoreShop(id: ID!): ShopResponse!
    verifyShop(id: ID!): ShopResponse!
  }
`;
