const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type User{
        token: String!
        id: Int!
    }


    input signupData{
        name: String!
        email: String!
        password: String!
        confirm: String!
    }

    type RootQuery{
        login(email: String!, password: String!): User!
    }

    type RootMutation {
        signup(signupInput: signupData): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
