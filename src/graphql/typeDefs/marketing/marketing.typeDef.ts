import { gql } from "apollo-server-express";

const marketing = gql`

    type Marketing {
        _id: ID
        title: String
        description: String
        image: String
        customer: [Customer]
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

    type MarketingPagination {
        data: [Marketing]
        paginator: Paginator
    }

    input MarketingInput {
        title: String
        description: String,
        image: String
        customer: [ID]
    }

    type Query {
        getMarketings(page: Int, limit: Int, pagination: Boolean keyword: String): MarketingPagination
    }

    type Mutation {
        createMarketing(input: MarketingInput): ResponseMessage!
        updateMarketing(id: ID, input: MarketingInput): ResponseMessage!
        deleteMarketing(id: ID): ResponseMessage!
        forgotPassword(email: String!, images: [String]): ResponseMessage!
        telegramBot(phone_number: [String], messages: String): ResponseMessage!
    }
`

export default marketing