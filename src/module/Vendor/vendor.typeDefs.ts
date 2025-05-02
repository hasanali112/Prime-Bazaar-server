export const VendorTypeDefs = `#graphql
  type VendorListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Vendor]
  }

  type SingleVendorResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Vendor
  }

  type Vendor {
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
    shop: ShopDetailInfo
  }

  type ShopDetailInfo {
    id: ID!
    name: String!
    logo: String
    description: String
    email: String!
    contactNumber: String!
    status: String!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
    products: [Product]
    coupons: [Coupon]
  }

  # Product information
  type Product {
    id: ID!
    sku: String!
    name: String!
    description: String
    price: Float!
    stockQuantity: Int!
    discountPercent: Float
    brand: String!
    status: String!
    variants: [Variant]
    itemCategory: ItemCategory
  }

  # Product variant
  type Variant {
    id: ID!
    color: String
    images: [String]
    sizes: [String]
  }

  # Item category
  type ItemCategory {
    id: ID!
    name: String!
  }

  # Coupon information
  type Coupon {
    id: ID!
    code: String!
    description: String
    discountType: String!
    discountValue: Float!
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    startDate: String!
    endDate: String!
    isActive: Boolean!
  }

  type Query {
    vendors(page: Int, limit: Int, searchTerm: String): VendorListResponse!
    getSingleVendor(id: ID!): SingleVendorResponse!
  }
`;
