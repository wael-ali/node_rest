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
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    type AuthData {
        token: String!
        userId: String!
    }
    type PostsData {
        posts: [Post!]!
        totalPosts: Int!
    }
    
    
   type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
   }
   type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostsData!
        post(id: ID!): Post!
   }
    schema {
        query: RootQuery
        mutation:  RootMutation
    }
`);