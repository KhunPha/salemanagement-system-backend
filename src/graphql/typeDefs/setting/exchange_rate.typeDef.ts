import { gql } from "apollo-server-express";

const exchange_rate = gql`
    type ExchangeRate {
        _id: ID
        exchange_rate: Float
    }

    input ExchangeRateInput {
        exchange_rate: Float
    }

    type Query {
        getExchangeRate: ExchangeRate
        getAllExchangeRate: [ExchangeRate]
        getNBCExchangeRate: Float
    }

    type Mutation {
        exchangeRate(input: ExchangeRateInput): ResponseMessage!
    }
`

export default exchange_rate