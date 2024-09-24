import { gql } from "apollo-server-express";

const unit_product_discount = gql`
    type UnitProductDiscount {
        product_details: Product
        discount: Float
    }

    input UnitProductDiscountInput {
        product_details: ID
        discount: Float
    }
`

export default unit_product_discount