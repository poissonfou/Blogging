const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type AuthData{
        token: String!
        id: Int!
    }

    type Message{
        message: String!
        data: PostData
    }

    type User{
        name: String!
        picture: String
        posts: [PostData]
        followers: [String]
        following: [String]
        tag: String
    }

    type PostData{
        id: Int!
        title: String!
        abstract: String!
        body: String!
        images: [String]!
        tags: [String]!
        createdAt: String
        updatedAt: String
    }

    input addPostInput{
        title: String!
        abstract: String!
        body: String!
        tags: [String]
        images: [String]
        userId: Int!
    }

    input editPostInput{
        title: String!
        abstract: String!
        body: String!
        tags: [String]
        images: [String]
        postId: Int!
    }

    input signupData{
        name: String!
        email: String!
        password: String!
        confirm: String!
    }

    type RootQuery{
        getUser(id: Int!): User!
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        signup(signupInput: signupData): AuthData!
        update(name: String, password: String, confirm: String, id: Int): Message!
        addPost(postInput: addPostInput): Message!
        editPost(postInput: editPostInput): Message!
        deletePost(id: Int): Message!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
