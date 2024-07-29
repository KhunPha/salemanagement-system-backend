import { gql } from "apollo-server-express";

const receiveproduct = gql`
    type ReceiveProduct {
        _id: ID
        purchase_id: ID
        product_lists: [Products]
    }

    type Products {
        products: Product
        qty: Int
    }

    input ProductsInput {
        products: ID
        qty: Int
    }

    input ReceiveProductInput {
        purchase_id: ID
        product_lists: [ProductsInput]
    }

    type Query {
        getReceiveProduct(id: ID): [ReceiveProduct]
    }

    type Mutation {
        processReceiveProduct(input: ReceiveProductInput): ResponseMessage!
    }
`

export default receiveproduct