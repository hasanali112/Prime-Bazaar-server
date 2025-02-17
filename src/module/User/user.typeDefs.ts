export const UserTypeDefs = `#graphql
  type UserListResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: [User]
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

  type Query {
    me: UserResponse!
    getAllUsers(
      page: Int
      limit: Int
      role: String
      status: UserStatus
      searchTerm: String
    ): UserListResponse!
  }

  type Mutation {
    updateUserStatus(input: UpdateUserStatusInput!): UserResponse!
  }
`;
