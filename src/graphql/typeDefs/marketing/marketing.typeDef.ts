import { gql } from "apollo-server-express";

const marketing = gql`
    scalar Upload

    type Marketing {
        _id: ID
        title: String
        description: String
        image: String
    }

    type SendDetails {
        customer_lists: [Customers]
        message: String
    }

    type Customers {
        customer_details: Customer
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
        description: String
    }

    type Query {
        getMarketings(page: Int, limit: Int, pagination: Boolean keyword: String): MarketingPagination
        getTelegramSend: [SendDetails]
        getEmailSend: [SendDetails]
    }

    type Mutation {
        createMarketing(input: MarketingInput, file: Upload): ResponseMessage!
        updateMarketing(id: ID, input: MarketingInput): ResponseMessage!
        deleteMarketing(id: ID): ResponseMessage!
        emailMarketing(customer: [ID], marketing_id: ID): ResponseMessage!
        telegramMarketing(customer: [ID], marketing_id: ID): ResponseMessage!
        importMarketingExcel(file: Upload!): ResponseMessage!
        importMarketingCSV(file: Upload!): ResponseMessage!
        exportMarketingExcel(savePath: String!): ResponseMessage!
        exportMarketingCSV(savePath: String!): ResponseMessage!
    }
`

export default marketing