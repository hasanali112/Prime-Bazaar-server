export const CategoryTypeDefs = `#graphql
  type MainCategoryResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: MainCategory
  }

  type MainCategoryListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [MainCategory]
  }

  type SubCategoryResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: SubCategory
  }

  type SubCategoryListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [SubCategory]
  }

  type ItemCategoryResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: ItemCategory
  }

  type ItemCategoryListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [ItemCategory]
  }

  type CategoryUpdateResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String!
    data: CategoryResult
  }

  type MainCategory {
    id: ID!
    name: String!
    description: String
    subCategories: [SubCategory!]
    createdAt: String!
    updatedAt: String!
  }

  type SubCategory {
    id: ID!
    name: String!
    description: String
    mainCategory: MainCategory!
    itemCategories: [ItemCategory!]
    createdAt: String!
    updatedAt: String!
  }

  type ItemCategory {
    id: ID!
    name: String!
    description: String
    subCategory: SubCategory!
    createdAt: String!
    updatedAt: String!
  }

  input CreateMainCategoryInput {
    name: String!
    description: String
  }

  input CreateSubCategoryInput {
    name: String!
    description: String
    mainCategoryId: ID!
  }

  input CreateItemCategoryInput {
    name: String!
    description: String
    subCategoryId: ID!
  }

  input UpdateCategoryInput {
    name: String
    description: String
    categoryType: CategoryType!
    parentId: ID
  }

  union CategoryResult = MainCategory | SubCategory | ItemCategory

  enum CategoryType {
    MAIN
    SUB
    ITEM
  }

  type Query {
    mainCategories(page: Int, limit: Int, searchTerm: String): MainCategoryListResponse!
    mainCategory(id: ID!): MainCategoryResponse!
    subCategories(mainCategoryId: ID!, page: Int, limit: Int, searchTerm: String): SubCategoryListResponse!
    subCategory(id: ID!): SubCategoryResponse!
    itemCategories(subCategoryId: ID!, page: Int, limit: Int, searchTerm: String): ItemCategoryListResponse!
    itemCategory(id: ID!): ItemCategoryResponse!
  }

  type Mutation {
    createMainCategory(input: CreateMainCategoryInput!): MainCategoryResponse!
    deleteMainCategory(id: ID!): MainCategoryResponse!
    createSubCategory(input: CreateSubCategoryInput!): SubCategoryResponse!
    deleteSubCategory(id: ID!): SubCategoryResponse!
    createItemCategory(input: CreateItemCategoryInput!): ItemCategoryResponse!
    deleteItemCategory(id: ID!): ItemCategoryResponse!
    updateCategory(id: ID!, input: UpdateCategoryInput!): CategoryUpdateResponse!
  }
`;
