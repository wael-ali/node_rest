const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        updatedAt: String!
        createdAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        status: String!
        password: String
        posts: [Post!]!
    }
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
    type AuthData {
        token: String!
        userId: String!
    }
   type RootMutation {
        createUser(userInput: UserInputData): User!
   }
   type RootQuery {
        login(email: String!, password: String!): AuthData!
   }
    schema {
        query: RootQuery
        mutation:  RootMutation
    }
`);