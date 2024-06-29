import { gql } from "apollo-server-express";

const user = gql`
    scalar Upload

    type User {
        _id: ID!
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
    }

    input Login {
        username: String
        password: String
    }

    type Query {
        getUsers(keyword: String, page: Int, limit: Int): [User]
    }

    type Mutation {
        createUser(data: UserInput!, file: Upload): Response!
        login(data: Login): ResponseLogin!
        updateUser(id: ID!, data: UserInput): Response!
        deleteUser(id: ID!): Response!
    }

    type Subscription {
        getnewUser: User!
    }
`

export default user