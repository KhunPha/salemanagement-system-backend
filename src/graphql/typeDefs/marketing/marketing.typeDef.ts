import { gql } from "apollo-server-express";

const marketing = gql`
    type Marketing {
        _id: ID
        title: String
        description: String
        image: String
        customer: [Customer]
    }

    input MarketingInput {
        title: String
        description: String,
        image: String
        customer: [ID]
    }

    type Query {
        getMarketings(page: Int, limit: Int, search: String): [Marketing]
    }

    type Mutation {
        createMarketing(data: MarketingInput): Response
        updateMarketing(id: ID, data: MarketingInput): Response
        deleteMarketing(id: ID): Response
    }
`

export default marketing