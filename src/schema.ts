export const typeDefs = `#graphql
 type Query {
    me : User
    users:[User]
    admins : [Admin]
    vendors : [Vendor]
    customers : [Customer]
  
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
  message: String!
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
