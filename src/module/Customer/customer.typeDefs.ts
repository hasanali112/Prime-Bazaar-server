export const CustomerTypeDefs = `#graphql
  type CustomerListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Customer]
  }

  type Customer {
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

  type Query {
    customers(page: Int, limit: Int): CustomerListResponse!
  }
`;
