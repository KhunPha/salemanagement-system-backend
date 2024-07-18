import { gql } from "apollo-server-express";

const brand = gql`
    type Brand {
        _id: ID
        brand_name: String
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
    }

    type Mutation {
        createBrand(input: BrandInput): ResponseMessage
        updateBrand(id: ID, input: BrandInput): ResponseMessage
        deleteBrand(id: ID): ResponseMessage
    }
`

export default brand