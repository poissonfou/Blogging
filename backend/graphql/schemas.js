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
        id: Int
        name: String!
        picture: String
        posts: [PostData]
        followers: [String]
        following: [String]
        tag: String
    }

    type PostData{
        author: User
        id: Int!
        title: String!
        abstract: String!
        body: String!
        images: [String]!
        tags: [String]!
        createdAt: String
        updatedAt: String
        comments: [Comment]
    }

    type Comment {
        id: Int
        content: String!
        author: String!
        picture: String
        authorId: Int!
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
        getPost(postId: Int!, authorId: Int!):PostData
        login(email: String!, password: String!): AuthData!
        search(query: String): [User]
    }

    type RootMutation {
        signup(signupInput: signupData): AuthData!
        update(name: String, password: String, confirm: String, id: Int): Message!
        addPost(postInput: addPostInput): Message!
        editPost(postInput: editPostInput): Message!
        deletePost(id: Int): Message!
        follow(id: Int, userId: Int): Follower
        unfollow(id: Int, userId: Int): Message
        comment(postId: Int, comment: String, author: String, picture: String, authorId: Int): Comment
        commentInteraction(type: String!, userId: Int!, commentId: Int!): Message!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
