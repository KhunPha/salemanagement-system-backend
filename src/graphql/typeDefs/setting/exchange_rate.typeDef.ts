import { gql } from "apollo-server-express";

const exchange_rate = gql`
    type ExchangeRate {
        _id: ID
        exchange_rate: Float
        isActive: Boolean
    }

    input ExchangeRateInput {
        exchange_rate: Float
        isActive: Boolean
    }

    type Query {
        getExchangeRate: ExchangeRate
        getAllExchangeRate: [ExchangeRate]
        getNBCExchangeRate: Float
    }

    type Mutation {
        exchangeRate(input: ExchangeRateInput): ResponseMessage!
        applyUse(id: ID): ResponseMessage
    }
`

export default exchange_rate