import { gql } from "apollo-server-express";

const color = gql`
    scalar Upload

    type Color {
        _id: ID
        color_code: String,
        color_name: String,
        remark: String
        createdBy: User
        modifiedBy: User
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

    type ColorPagination {
        data: [Color]
        paginator: Paginator
    }

    input ColorInput {
        color_code: String,
        color_name: String,
        remark: String
    }

    type Query {
        getColors(page: Int, limit: Int, pagination: Boolean, keyword: String): ColorPagination
        getColorRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): ColorPagination
    }

    type Mutation {
        createColor(input: ColorInput): ResponseMessage!
        updateColor(id: ID, input: ColorInput): ResponseMessage!
        deleteColor(id: ID): ResponseMessage!
        importColorExcel(file: Upload!): ResponseMessage!
        importColorCSV(file: Upload!): ResponseMessage!
        exportColorExcel(savePath: String!): ResponseMessage!
        exportColorCSV(savePath: String!): ResponseMessage!
        recoveryColor(id: ID!): ResponseMessage!
        recoveryManyColor(id: [ID]): ResponseMessage!
        recoveryColorDelete(id: ID!): ResponseMessage!
    }
`

export default color