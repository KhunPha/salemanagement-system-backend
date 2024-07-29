import { gql } from "apollo-server-express";

const secondhand = gql`
    type SecondHand {
        _id: ID
        pro_name: String
        price: Float
        barcode: String
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

    type SecondHandPagination {
        data: [SecondHand]
        paginator: Paginator
    }

    input SecondHandInput {
        pro_name: String
        price: Float
        barcode: String
        remark: String
    }

    type Query {
        getSecondHands(page: Int, limit: Int, pagination: Boolean, keyword: String): SecondHandPagination
    }

    type Mutation {
        createSecondHand(input: SecondHandInput): ResponseMessage!
        updateSecondHand(id: ID, input: SecondHandInput): ResponseMessage!
        deleteSecondHand(id: ID): ResponseMessage!
    }
`

export default secondhand