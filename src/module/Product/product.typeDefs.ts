export const ProductTypeDefs = `#graphql
  type Product {
    id: ID!
    sku: String!
    name: String!
    description: String
    price: Float!
    stockQuantity: Int!
    discountPercent: Float
    brand: String!
    isFlashSale: Boolean!
    flashSaleEndTime: String
    shippingMethods: ShippingMethod!
    shippingCharge: Float
    status: ProductStatus!
    createdAt: String!
    updatedAt: String!
    shop: Shop!
    itemCategory: ItemCategory!
    variants: [Variant!]
    coupon: Coupon
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

  type Variant {
    id: ID!
    color: String
    images: [String!]!
    sizes: [String!]!
    createdAt: String!
    updatedAt: String!
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

  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
  }

  type ProductListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Product]
  }

  type ProductResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: Product
  }

  input CreateProductInput {
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
    itemCategoryId: ID!
    variants: [VariantInput]
  }

  input VariantInput {
    color: String
    images: [Upload!]!
    sizes: [String!]
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stockQuantity: Int
    discountPercent: Float
    brand: String
    isFlashSale: Boolean
    flashSaleEndTime: String
    shippingMethods: ShippingMethod
    shippingCharge: Float
    status: ProductStatus
    itemCategoryId: ID
    variants: [UpdateVariantInput]
  }

  input UpdateVariantInput {
    id: ID!
    color: String
    images: [Upload!]
    sizes: [String]
  }

  input ProductFilterInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: SortOrder
    minPrice: Float
    maxPrice: Float
    brand: String
    itemCategoryId: ID
    isFlashSale: Boolean
    status: ProductStatus
    searchTerm: String
  }

  enum SortOrder {
  ASC
  DESC
  LOW_TO_HIGH
  HIGH_TO_LOW
  NEWEST
  OLDEST
}

  type Query {
    getAllProducts(
      filters: ProductFilterInput   
    ): ProductListResponse!
    
    getProduct(id: ID!): ProductResponse!
    
    getShopProducts(
      shopId: ID!
      filters: ProductFilterInput
    ): ProductListResponse!
    
    getMyShopProducts(
      filters: ProductFilterInput
    ): ProductListResponse!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): ProductResponse!
    
    updateProduct(
      id: ID!
      input: UpdateProductInput!
    ): ProductResponse!
    
    deleteProduct(id: ID!): ProductResponse!

    addVariant(
      productId: ID!
      variant: VariantInput!
    ): ProductResponse!
    
    updateVariant(
      productId: ID!
      input: UpdateVariantInput!
    ): ProductResponse!
    
    deleteVariant(
      productId: ID!
      variantId: ID!
    ): ProductResponse!
  }
`;
