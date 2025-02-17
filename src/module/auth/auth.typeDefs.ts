export const AuthTypeDefs = `#graphql
  type LoginResponse {
    statusCode: Int!
    success: Boolean!
    message: String!
    accessToken: String!
  }

  type UserResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    data: User
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

  input LoginInput {
    email: String!
    password: String!
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

  type Mutation {
    login(input: LoginInput!): LoginResponse!
    userSignUp(input: UserSignUpInput!): UserResponse!
  }
`;
