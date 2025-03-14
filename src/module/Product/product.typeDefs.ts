// product.typeDefs.ts
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
  }

  type Variant {
    id: ID!
    color: String
    images: [String!]!
    sizes: [String!]!
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
    variants: [VariantInput!]
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
    sizes: [String!]
  }

  input ProductFilterInput {
    minPrice: Float
    maxPrice: Float
    brand: [String!]
    itemCategoryId: ID
    isFlashSale: Boolean
    status: ProductStatus
    searchTerm: String
  }

  type Query {
    getAllProducts(
      page: Int
      limit: Int
      filters: ProductFilterInput
      sortBy: String
      sortOrder: String
    ): ProductListResponse!
    
    getProduct(id: ID!): ProductResponse!
    
    getShopProducts(
      shopId: ID!
      page: Int
      limit: Int
      filters: ProductFilterInput
      sortBy: String
      sortOrder: String
    ): ProductListResponse!
    
    getMyShopProducts(
      page: Int
      limit: Int
      filters: ProductFilterInput
      sortBy: String
      sortOrder: String
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
