import { gql } from "apollo-server-express";

const sales = gql`
    type ProductDetails {
        _id: ID
        product_name: ID
        qty: Int
        amount: Float
    }

    type Sales {
        product_details: [ProductDetails]
        cashier: String,
        total_qty: Int
        total_amount: Float
        discount_type: String,
        discount: Float
        product_add: [ProductAdd]
        unit_product_discount: [ProductDiscount]
    }

    Input ProductDetailsInput {
        product_name: ID
        qty: Int
        amount: Float
    }

    input SalesInput {
        product_details: [ProductDetails]
        cashier: String
        total_qty: Int
        total_amount: Float
        discount_type: String
        discount: Float
        product_add: [ID]
        unit_product_discount: [ID]
    }
`

export default sales