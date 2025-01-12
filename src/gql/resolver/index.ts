export const resolvers = {
  Query: {},
  Mutation: {
    userSignUp: (parent: any, args: any, context: any) => {
      console.log(args);
    },
  },
};
