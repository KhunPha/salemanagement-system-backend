import { gql } from "apollo-server-express";

const user = gql`
    scalar Upload

    type User {
        _id: ID!
        firstname: String!
        lastname: String
        username: String
        password: String,
        roles: RoleType,
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

    enum RoleType {
        SUPER_ADMIN
        ADMIN
        SALER
        STOCK
    }

    input Login {
        username: String
        password: String
    }

    input SearchInput {
        search: String
    }

    type Query {
        getUsers(search: String, page: Int, limit: Int): [User]
    }

    type Mutation {
        createUser(data: UserInput!, file: Upload): User
        login(data: Login): User
        updateUser(id: ID!, data: UserInput): User,
        deleteUser(id: ID!): User
    }
`

export default user