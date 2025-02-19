// shop.typeDefs.ts
export const ShopTypeDefs = `#graphql
  type Shop {
    id: ID!
    name: String!
    logo: String!
    description: String
    email: String!
    contactNumber: String!
    status: ShopStatus!
    isVerified: Boolean!
    isDeleted: Boolean!
    isTemporaryDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
    vendor: Vendor
    products: [Product]
  }

  type ShopListResponse implements BaseResponse {
    statusCode: Int
    success: Boolean
    message: String
    meta: Meta
    data: [Shop]
  }

  type ShopResponse implements BaseResponse {
    statusCode: Int
    success: Boolean
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
    isTemporaryDeleted: Boolean
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
    verifyShop(id: ID!): ShopResponse!
  }
`;
