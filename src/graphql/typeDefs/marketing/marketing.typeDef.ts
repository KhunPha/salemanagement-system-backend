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
        getMarketings(page: Int, limit: Int, keyword: String): [MarketingPagination]
    }

    type Mutation {
        createMarketing(input: MarketingInput): Response!
        updateMarketing(id: ID, input: MarketingInput): Response!
        deleteMarketing(id: ID): Response!
    }
`

export default marketing