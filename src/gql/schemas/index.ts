export const typeDefs = `#graphql
 type Query {
    user : User
    admin : Admin
    vendor : Vendor
    customer : Customer
  }

type Mutation {
  userSignUp(input: UserSignUpInput!): User
  createAdmin(input: CreateAdminInput!): Admin
}

input UserSignUpInput {
  email: String!
  password: String!
  role: String!
}

input CreateAdminInput {
  name: String!
  email: String!
  contactNumber: String!
  emergencyContactNumber: String!
  gender: String!
  address: String!
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
