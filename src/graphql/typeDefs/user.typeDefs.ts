import { gql } from "apollo-server-express";

const user = gql`
    type User {
        _id: String!
        firstname: String!
        lastname: String
        username: String
        password: String
    }

    input UserInput {
        firstname: String
        lastname: String
        username: String
        password: String
    }

    type Query {
        getUsers: [User]
    }

    type Mutation {
        createUser(data: UserInput!): User
    }
`

export default user