import { gql } from "apollo-server-express";

const marketing = gql`

    type Marketing {
        _id: ID
        title: String
        description: String
        image: String
        customer: [Customer]
    }

    type SendDetails {
        customer_lists: [Customers]
        message: String
    }

    type Customers {
        customer: Customer
        status: String
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
        getTelegramSend: [SendDetails]
    }

    type Mutation {
        createMarketing(input: MarketingInput): ResponseMessage!
        updateMarketing(id: ID, input: MarketingInput): ResponseMessage!
        deleteMarketing(id: ID): ResponseMessage!
        emailMarketing(customer: [ID], images: [String]): ResponseMessage!
        telegramMarketing(customer: [ID], messages: String): ResponseMessage!
    }
`

export default marketing