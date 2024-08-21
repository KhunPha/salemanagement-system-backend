import { gql } from "apollo-server-express";

const category = gql`
    scalar Upload

    type Category {
        _id: ID!,
        category_name: String,
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

    type CategoryPagination {
        data: [Category]
        paginator: Paginator
    }

    input CateInput {
        category_name: String,
        remark: String
    }

    type Query {
        getCategories(page: Int, limit: Int, pagination: Boolean, keyword: String): CategoryPagination
    }

    type Mutation {
        createCategory(input: CateInput): ResponseMessage!
        updateCategory(id: ID!, input: CateInput): ResponseMessage!
        deleteCategory(id: ID!): ResponseMessage!
        importCategoryExcel(file: Upload!): ResponseMessage!
        importCategoryCSV(file: Upload!): ResponseMessage!
        exportCategoryExcel(savePath: String!): ResponseMessage!
        exportCategoryCSV(savePath: String!): ResponseMessage!
    }
`

export default category