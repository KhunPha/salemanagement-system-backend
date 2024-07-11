import { gql } from "apollo-server-express";

const payment_purchase = gql`
    type PaymentPurchase {
        _id: ID
        pruchase_id: ID
        total_dollar: Float
        total_riel: Float
        payment_method: String
        bank: Bank
        remark: String
    }

    input PaymentPurchaseInput {
        pruchase_id: ID
        total_dollar: Float
        total_riel: Float
        payment_method: String
        bank: ID
        remark: String
    }

    type Query {
        getPaymentPurchases(id: ID): [PaymentPurchase]
    }

    type Mutation {
        paymentPurchase(input: PaymentPurchaseInput): ResponseMessage!
    }
`

export default payment_purchase