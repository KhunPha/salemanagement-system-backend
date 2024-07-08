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
        remark: String
        token: String
    }

    type Paginator {
        slNo: Int
        prev: Int
        next: Int
        perPage: Int
        totalPosts: Int
        totalPages: Int
        currentPage: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
        totalDocs: Int
    }

    type UserPagination {
        data: [User]
        paginator: Paginator
    }

    input UserInput {
        firstname: String
        lastname: String
        username: String
        password: String,
        roles: String
        remark: String
    }

    input Login {
        username: String
        password: String
    }

    type Query {
        getUsers(keyword: String, page: Int, pagination: Boolean, limit: Int): UserPagination
    }

    type Mutation {
        createUser(input: UserInput!, file: Upload): Response!
        login(input: Login): ResponseLogin!
        updateUser(id: ID!, input: UserInput): Response!
        deleteUser(id: ID!): Response!
    }

    type Subscription {
        getnewUser: User!
    }
`

export default user