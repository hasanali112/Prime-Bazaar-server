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
  data: [Category]
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
  
  categories: CategoryListResponse!
  category(id: ID!): CategoryResponse!
}

#  Mutations
type Mutation {
  userSignUp(input: UserSignUpInput!): UserResponse!
  login(input: LoginInput!): LoginResponse!
  updateUserStatus(input: UpdateUserStatusInput!): UserResponse!
  createCategory(input: CreateCategoryInput!): CategoryResponse!
  updateCategory(id: ID!, input: UpdateCategoryInput!): CategoryResponse!
  deleteCategory(id: ID!): CategoryResponse!
}

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

input UpdateUserStatusInput {
  userId: ID!
  status: UserStatus!
  startTime: String
  endTime: String
}

enum UserStatus {
  ACTIVE
  BLOCKED
  SUSPENDED
  DELETED
}


input CreateCategoryInput {
  name: String!
  categoryCode: String!
  image: Upload!
}

input UpdateCategoryInput {
  name: String
  categoryCode: String
  image: Upload
}

type Category {
  id: ID!
  name: String!
  image: String!
  categoryCode: String!
  createdAt: String!
  updatedAt: String!
}
 
`;
