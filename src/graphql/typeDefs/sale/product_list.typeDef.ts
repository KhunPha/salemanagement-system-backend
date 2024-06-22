import { gql } from "apollo-server-express";

const product_lists = gql`
    type ProductList {
        product: Product
        qty: Int
        amount: Float
    }

    input ProductListInput {
        product: ID
        qty: Int
        amount: Float
    }
`

export default product_lists