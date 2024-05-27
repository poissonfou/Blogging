const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type AuthData{
        token: String!
        id: Int!
    }

    type Message{
        message: String!
        data: Post
    }

    type Search {
        users: [User]
        posts: [Post]
    }

    type User{
        id: Int
        name: String!
        picture: String
        posts: [Post]
        followers: [Follower!]
        following: [Follower!]
        tag: String
    }

    type Post {
        author: User
        id: Int!
        title: String!
        abstract: String!
        body: String!
        images: [String]!
        tags: [String]!
        createdAt: String
        updatedAt: String
    }

    type Comment {
        id: Int
        content: String!
        author: User!
        likes: [Int!]
        dislikes: [Int!]
    }

    type Follower {
        name: String
        id: Int
        picture: String
        tag: String
    }

    input addPostInput{
        title: String!
        abstract: String!
        body: String!
        tags: [String]
        images: [String]
        token: String!
    }

    input editPostInput{
        title: String!
        abstract: String!
        body: String!
        tags: [String]
        images: [String]
        postId: Int!
        token: String!
    }

    input signupData{
        name: String!
        email: String!
        password: String!
        confirm: String!
    }

    type RootQuery{
        getUser(id: Int!, token: String, route: String): User!
        getPost(postId: Int!):Post
        getComments(postId: Int): [Comment]
        login(email: String!, password: String!): AuthData!
        search(query: String!, userId: Int): Search
    }

    type RootMutation {
        signup(signupInput: signupData): AuthData!
        update(name: String, password: String, confirm: String, token: String): Message!
        addPost(postInput: addPostInput): Message!
        editPost(postInput: editPostInput): Message!
        deletePost(id: Int, token: String): Message!
        follow(id: Int, token: String): Follower
        unfollow(id: Int, token: String): Message
        comment(postId: Int, comment: String, token: String): Comment
        commentInteraction(type: String!, token: String, commentId: Int!): Message!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
