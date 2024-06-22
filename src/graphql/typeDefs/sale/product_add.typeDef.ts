import { gql } from "apollo-server-express";

const product_add = gql`
    type ProductAdd {
        product_details: Product
        qty: Int
    }

    input ProductAddInput {
        product_details: ID
        qty: Int
    }
`
export default product_add