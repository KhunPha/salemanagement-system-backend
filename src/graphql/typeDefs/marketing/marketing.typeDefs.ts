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
        createMarketing(data: MarketingInput): Respone
        updateMarketing(id: ID, data: MarketingInput): Respone
        deleteMarketing(id: ID): Respone
    }
`

export default marketing