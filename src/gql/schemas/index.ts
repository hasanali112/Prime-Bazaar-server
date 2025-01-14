export const typeDefs = `#graphql
 type Query {
    user : User
    admin : Admin
    vendor : Vendor
    customer : Customer
  }

type Mutation {
  userSignUp(input: UserSignUpInput!): User
  login(input: LoginInput!): LoginResponse
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
  accessToken: String!
}


type User {
  id: ID!
  email: String!
  role: String!
  createdAt: String!
  updatedAt: String!
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


 
`;
