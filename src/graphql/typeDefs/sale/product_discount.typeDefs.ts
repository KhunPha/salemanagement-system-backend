import { gql } from "apollo-server-express";

const product_discount = gql`
    type ProductDiscount {
        _id: ID!
        product: Product,
        discount_type: String,
        discount: Float
    }

    input ProductDiscountInput {
        product: ID,
        discount_type: String,
        discount: Float
    }
`

export default product_discount