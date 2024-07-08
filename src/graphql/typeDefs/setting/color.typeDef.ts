import { gql } from "apollo-server-express";

const color = gql`
    type Color {
        _id: ID
        color_code: String,
        color_name: String,
        remark: String
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
    }

    type Mutation {
        createColor(input: ColorInput): Response!
        updateColor(id: ID, input: ColorInput): Response!
        deleteColor(id: ID): Response!
    }
`

export default color