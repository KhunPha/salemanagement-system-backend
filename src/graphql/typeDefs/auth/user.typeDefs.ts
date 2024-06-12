import { gql } from "apollo-server-express";

const user = gql`
    type User {
        _id: String!
        firstname: String!
        lastname: String
        username: String
        password: String,
        roles: String,
        image: String,
        token: String
    }

    input UserInput {
        firstname: String
        lastname: String
        username: String
        password: String,
        roles: String
        image: String
    }

    input Login {
        username: String
        password: String
    }

    input SearchInput {
        search: String
    }

    type Query {
        getUsers: [User]
        getUsersSearch(search: SearchInput): [User]
    }

    type Mutation {
        createUser(data: UserInput!): User
        login(data: Login): User
    }
`

export default user