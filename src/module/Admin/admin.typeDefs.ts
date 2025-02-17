export const AdminTypeDefs = `#graphql
  type AdminListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Admin]
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

  type Query {
    admins(page: Int, limit: Int): AdminListResponse!
  }
`;
