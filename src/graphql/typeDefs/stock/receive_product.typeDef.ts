import { gql } from "apollo-server-express";

const receiveproduct = gql`
    type ReceiveProduct {
        _id: ID
        purchase_id: ID
        product_lists: [ProductReceiver]
        product_unit_type: String
        createdBy: User
        modifiedBy: User
    }

    type ProductReceiver {
        product_details: Product
        unit_price: Float
        whole: Int
        retail_in_whole: Int
    }

    input ProductInputReceiver {
        product_details: ID
        unit_price: Float
        whole: Int
        retail_in_whole: Int
    }

    input ReceiveProductInput {
        purchase_id: ID
        product_lists: [ProductInputReceiver]
        product_unit_type: String
    }

    type Query {
        getReceiveProductTransac(id: ID): [ReceiveProduct]
    }

    type Mutation {
        processReceiveProduct(input: ReceiveProductInput): ResponseMessage!
    }
`

export default receiveproduct