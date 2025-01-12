export const typeDefs = `#graphql
 type Query {
    user : User
  }




 type User{
    id        :    ID!
    email     :    String!
    role      :    String!
    createdAt :    String!
    updatedAt :    String!
 
 }


 
`;
