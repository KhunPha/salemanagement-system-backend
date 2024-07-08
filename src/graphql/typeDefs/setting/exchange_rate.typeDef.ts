import { gql } from "apollo-server-express";

const exchange_rate = gql`
    type ExchangeRate {
        _id: ID
        exchange_rate_name: String
        exchange_rate: Float
        status: Boolean
        remark: String
    }

    input ExchangeRateInput {
        exchange_rate_name: String
        exchange_rate: Float
        status: Boolean
        remark: String
    }

    type Query {
        getExchangeRate: ExchangeRate
    }

    type Mutation {
        createExchangeRate(input: ExchangeRateInput): Response!
        updateExchangeRate(id: ID, input: ExchangeRateInput): Response!
    }
`

export default exchange_rate