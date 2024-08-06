import { gql } from "apollo-server-express";

const unit_product_discount = gql`
    type UnitProductDiscount {
        sale_id: ID
        product_details: Product
        discount_type: String
        discount: Float
    }

    input UnitProductDiscountInput {
        sale: ID
        product_details: ID
        discount_type: String
        discount: Float
    }
`

export default unit_product_discount