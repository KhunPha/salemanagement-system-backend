import { gql } from "apollo-server-express";

const unit_product_discount = gql`
    type UnitProductDiscount {
        product_details: Product
        discount_type: String
        discount: Float
    }

    input UnitProductDiscountInput {
        product_details: ID
        discount_type: String
        discount: Float
    }
`

export default unit_product_discount