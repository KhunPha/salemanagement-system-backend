import { gql } from "apollo-server-express";

const receiveproduct = gql`
    scalar Date

    type ReceiveProduct {
        _id: ID
        purchase_id: ID
        product_lists: [ProductReceiver]
        product_unit_type: String
        pay: Pay
        createdBy: User
        modifiedBy: User
    }

    type ProductReceiver {
        product_details: Product
        unit_price: Float
        whole: Int
        retail_in_whole: Int
        product_unit_type: String
    }

    input ProductInputReceiver {
        product_details: ID
        unit_price: Float
        whole: Int
        retail_in_whole: Int
        product_unit_type: String
    }

    input ReceiveProductInput {
        purchase_id: ID
        product_lists: [ProductInputReceiver]
        product_type: String
        pay: PayInput
        date_notify: Date
    }

    type Query {
        getReceiveProductTransac(id: ID): [ReceiveProduct]
    }

    type Mutation {
        processReceiveProduct(input: ReceiveProductInput): ResponseMessage!
    }
`

export default receiveproduct