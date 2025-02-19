export const UserTypeDefs = `#graphql
  type UserResponse implements BaseResponse {
    statusCode: Int!
    success: Boolean!
    message: String
    meta: Meta
    data: User
  }

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
    getSingleUser(id: ID!): UserResponse!
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
