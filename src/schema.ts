export const typeDefs = `#graphql
 type Query {
    me : User
    admins : [Admin]
    vendors : [Vendor]
    customers : [Customer]
    getAllUsers(
    page: Int, 
    limit: Int, 
    role: String, 
    status: String, 
    searchTerm: String
  ): UserListResponse!
  }

  type UserListResponse {
  meta: Meta
  data: [User]
}

type Meta {
  page: Int!
  limit: Int!
  total: Int!
}

type Mutation {
  userSignUp(input: UserSignUpInput!): User
  login(input: LoginInput!): LoginResponse
  updateUserStatus(input: UpdateUserStatusInput!): User!
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

type LoginResponse {
  message: String!
  accessToken: String!
}


type User {
  id: ID!
  email: String!
  role: String!
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
    id :                    ID!
    name :                  String!
    email :                 String!
    contactNumber :         String!
    emergencyContactNumber: String!
    gender :                String!
    profileImg  :           String!
    address     :           String!
    isDeleted :             Boolean!
    createdAt   :           String!
    updatedAt  :            String!
 }


 type Customer{
    id :                    ID!
    name :                  String!
    email :                 String!
    contactNumber :         String!
    emergencyContactNumber: String!
    gender :                String!
    profileImg  :           String!
    address     :           String!
    isDeleted :             Boolean!
    createdAt   :           String!
    updatedAt  :            String!
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
 
`;
