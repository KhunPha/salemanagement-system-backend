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
        createExchangeRate(data: ExchangeRateInput): Respone
        updateExchangeRate(id: ID, data: ExchangeRateInput): Respone
    }
`

export default exchange_rate