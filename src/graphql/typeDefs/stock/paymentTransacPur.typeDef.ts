import { gql } from "apollo-server-express";

const paymentTransacPur = gql`
    type PaymentTransacPur {
        _id: ID
        purchase_id: ID
        reil: Float
        dollar: Float
        isVoid: Boolean
        createdAt: Date
    }

    input PaymentTransacPurInput {
        purchase_id: ID
        reil: Float
        dollar: Float
        remiding_date: Date
        isNotify: Boolean
    }

    type Query {
        getPaymentTransacPur(purchase_id: ID): [PaymentTransacPur]
    }

    type Mutation {
        purchasePayment(input: PaymentTransacPurInput): ResponseMessage!
        voidPurchasePayment(payment_id: ID): ResponseMessage!
    }
`

export default paymentTransacPur