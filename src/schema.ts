export const typeDefs = `#graphql
  # Add Upload scalar
   scalar Upload

# Generic Response Interface
interface BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
}

# Existing Meta type
type Meta {
  page: Int!
  limit: Int!
  total: Int!
}

# Auth Response
type LoginResponse {
  statusCode: Int!
  success: Boolean!
  message: String!
  accessToken: String!
}

# Response Types for Each Entity
type UserResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  data: User
}

type UserListResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  meta: Meta
  data: [User]
}

type AdminListResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  meta: Meta
  data: [Admin]
}

type VendorListResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  meta: Meta
  data: [Vendor]
}

type CustomerListResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  meta: Meta
  data: [Customer]
}

type CategoryResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  data: Category
}
type CategoryListResponse implements BaseResponse {
  statusCode: Int!
  success: Boolean!
  message: String
  meta: Meta
  data: [Category]
}

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


#  Queries
type Query {
  me: UserResponse!
  admins(page: Int, limit: Int): AdminListResponse!
  vendors(page: Int, limit: Int): VendorListResponse!
  customers(page: Int, limit: Int): CustomerListResponse!
  getAllUsers(
    page: Int
    limit: Int
    role: String
    status: UserStatus
    searchTerm: String
  ): UserListResponse!
  
    mainCategories(page: Int, limit: Int, searchTerm: String): MainCategoryListResponse!
    mainCategory(id: ID!): MainCategoryResponse!
    subCategories(mainCategoryId: ID!, page: Int, limit: Int, searchTerm: String): SubCategoryListResponse!
    subCategory(id: ID!): SubCategoryResponse!
    itemCategories(subCategoryId: ID!, page: Int, limit: Int, searchTerm: String): ItemCategoryListResponse!
    itemCategory(id: ID!): ItemCategoryResponse!
}

#  Mutations
type Mutation {
  userSignUp(input: UserSignUpInput!): UserResponse!
  login(input: LoginInput!): LoginResponse!
  updateUserStatus(input: UpdateUserStatusInput!): UserResponse!
  
    createMainCategory(input: CreateMainCategoryInput!): MainCategoryResponse!
    updateMainCategory(id: ID!, input: UpdateMainCategoryInput!): MainCategoryResponse!
    deleteMainCategory(id: ID!): MainCategoryResponse!

    createSubCategory(input: CreateSubCategoryInput!): SubCategoryResponse!
    updateSubCategory(id: ID!, input: UpdateSubCategoryInput!): SubCategoryResponse!
    deleteSubCategory(id: ID!): SubCategoryResponse!

    createItemCategory(input: CreateItemCategoryInput!): ItemCategoryResponse!
    updateItemCategory(id: ID!, input: UpdateItemCategoryInput!): ItemCategoryResponse!
    deleteItemCategory(id: ID!): ItemCategoryResponse!
}



#type
type User {
  id: ID!
  email: String!
  role: String!
  status: String
  createdAt: String!
  updatedAt: String!
  admin: Admin
  vendor: Vendor
  customer: Customer
}

type Admin {
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

 type Vendor{
    id:                    ID!
    name:                  String!
    email:                 String!
    contactNumber:         String!
    emergencyContactNumber: String!
    gender:                String!
    profileImg:           String!
    address:             String!
    isDeleted:             Boolean!
    createdAt:           String!
    updatedAt:            String!
 }


 type Customer{
    id:                    ID!
    name:                  String!
    email:                 String!
    contactNumber:         String!
    emergencyContactNumber: String!
    gender:                String!
    profileImg:           String!
    address:           String!
    isDeleted:             Boolean!
    createdAt:           String!
    updatedAt:            String!
 }

# Category type
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


#input
#User input
input UserSignUpInput {
  email: String!
  password: String!
  role: String!
  name: String!
  contactNumber: String!
  emergencyContactNumber: String!
  gender: String!
  address: String!
}

input LoginInput {
  email: String!
  password: String!
}

input UpdateUserStatusInput {
  userId: ID!
  status: UserStatus!
  startTime: String
  endTime: String
}


# Category input
input CreateMainCategoryInput {
    name: String!
    description: String
  }

  input UpdateMainCategoryInput {
    name: String
    description: String
  }

  input CreateSubCategoryInput {
    name: String!
    description: String
    mainCategoryId: ID!
  }

  input UpdateSubCategoryInput {
    name: String
    description: String
    mainCategoryId: ID
  }

  input CreateItemCategoryInput {
    name: String!
    description: String
    subCategoryId: ID!
  }

  input UpdateItemCategoryInput {
    name: String
    description: String
    subCategoryId: ID
  }


  #enum
  enum UserStatus {
  ACTIVE
  BLOCKED
  SUSPENDED
  DELETED
}
 
`;
