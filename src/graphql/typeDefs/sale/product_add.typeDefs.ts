import { gql } from "apollo-server-express";

const product_add = gql`
    type ProductAdd {
        _id: ID,
        product: Product
        qty: Int
    }

    input ProductAddInput {
        product: ID
        qty: Int
    }
`

export default product_add