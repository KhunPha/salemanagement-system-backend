import { gql } from "apollo-server-express";

const exchange_rate = gql`
    type ExchangeRate {
        _id: ID
        exchange_rate_name: String
        exchange_rate: Float
        isActive: Boolean
        type: String
        remark: String
    }

    input ExchangeRateInput {
        exchange_rate_name: String
        exchange_rate: Float
        isActive: Boolean
        type: String
        remark: String
    }

    type Query {
        getExchangeRate: ExchangeRate
        getAllExchangeRate: [ExchangeRate]
    }

    type Mutation {
        exchangeRate(input: ExchangeRateInput): ResponseMessage!
        applyUse(id: ID): ResponseMessage
    }
`

export default exchange_rate