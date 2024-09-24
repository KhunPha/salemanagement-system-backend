import { gql } from "apollo-server-express";

const paymentTransacPur = gql`
    type PaymentTransacPur {
        purchase_id: ID
        reil: Float
        dollar: Float
    }

    type Query {
        getPaymentTransacPur(purchase_id: ID): [PaymentTransacPur]
    }
`

export default paymentTransacPur