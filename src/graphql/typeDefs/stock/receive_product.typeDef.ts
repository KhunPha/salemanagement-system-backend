import { gql } from "apollo-server-express";

const receiveproduct = gql`
    type ReceiveProduct {
        _id: ID
        purchase_id: ID
        product_lists: [Products]
        product_unit_type: String
    }

    type Products {
        product_details: Product
        unit_price: Float
        whole: Int
        retail_in_whole: Int
    }

    input ProductsInput {
        product_details: ID
        unit_price: Float
        whole: Int
        retail_in_whole: Int
    }

    input ReceiveProductInput {
        purchase_id: ID
        product_lists: [ProductsInput]
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