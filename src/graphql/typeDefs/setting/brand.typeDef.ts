import { gql } from "apollo-server-express";

const brand = gql`
    scalar Upload

    type Brand {
        _id: ID
        brand_name: String
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

    type BrandPagination {
        data: [Brand]
        paginator: Paginator
    }

    input BrandInput {
        brand_name: String
        remark: String
    }

    type Query {
        getBrands(page: Int, limit: Int, pagination: Boolean, keyword: String): BrandPagination
        getBrandRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): BrandPagination
    }

    type Mutation {
        createBrand(input: BrandInput): ResponseMessage!
        updateBrand(id: ID, input: BrandInput): ResponseMessage!
        deleteBrand(id: ID): ResponseMessage!
        importBrandExcel(file: Upload!): ResponseMessage!
        importBrandCSV(file: Upload!): ResponseMessage!
        exportBrandExcel(savePath: String!): ResponseMessage!
        exportBrandCSV(savePath: String!): ResponseMessage!
        recoveryBrand(id: ID!): ResponseMessage!
        recoveryBrandDelete(id: ID!): ResponseMessage!
    }
`

export default brand