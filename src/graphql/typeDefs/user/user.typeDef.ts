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
        publicId: String
        remark: String
        status: Boolean
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
        image: String
        publicId: String
        roles: String
        remark: String
    }

    input Login {
        username: String
        password: String
    }

    type imageUpload {
        url: String,
        publicId: String,
        status: Boolean
    }

    type Query {
        getUsers(keyword: String, page: Int, pagination: Boolean, limit: Int, roles: String): UserPagination
        getUserLogin: User
    }

    type Mutation {
        uploadUserImage(file: Upload): imageUpload
        deleteUserImage(publicId: String): Boolean
        createUser(input: UserInput!, file: Upload): ResponseMessage!
        login(input: Login): ResponseMessageLogin!
        loginForMobile(input: Login): ResponseMessageMobileLogin!
        logout: ResponseMessage!
        updateUser(id: ID!, input: UserInput): ResponseMessage!
        resetPassword(id: ID!, newPassword: String): ResponseMessage!
        changeUserStatus(id: ID!, status: Boolean): ResponseMessage!
    }

    type Subscription {
        getnewUser: User!
    }
`

export default user