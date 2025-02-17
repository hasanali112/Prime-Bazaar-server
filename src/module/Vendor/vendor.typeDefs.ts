export const VendorTypeDefs = `#graphql
  type VendorListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [Vendor]
  }

  type Vendor {
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
    vendors(page: Int, limit: Int): VendorListResponse!
  }
`;
