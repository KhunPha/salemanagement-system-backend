import { gql } from "apollo-server-express";

const product_lists = gql`
    type ProductList {
        product: Product
        qty: Int
        amount: Float
        discount: Float
    }

    input ProductListInput {
        product: ID
        qty: Int
        amount: Float
        discount: Float
    }
`

export default product_lists