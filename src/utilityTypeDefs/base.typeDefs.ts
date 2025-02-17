export const BaseTypeDefs = `#graphql
  scalar Upload

  interface BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
  }

  type Meta {
    page: Int!
    limit: Int!
    total: Int!
  }
`;
