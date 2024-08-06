import { gql } from "apollo-server-express";

const product_add = gql`
    type ProductAdd {
        sale_id: ID
        product_details: Product
        qty: Int
    }

    input ProductAddInput {
        sale_id: ID
        product_details: ID
        qty: Int
    }
`
export default product_add