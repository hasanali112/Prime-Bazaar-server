import { Mutation } from "./Mutation/Mutation";
import { Query } from "./Query/Query";
import { GraphQLUpload } from "graphql-upload-minimal";
export const resolvers = {
  Upload: GraphQLUpload,
  Query,
  Mutation,
};
