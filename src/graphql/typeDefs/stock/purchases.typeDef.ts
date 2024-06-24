import { gql } from "apollo-server-express";

const purchase = gql`
    scalar Date

    type Purchase {
        _id: ID
        supplier_details: Supplier
        products_lists: [PurchaseProductDetails]
        date: Date
        product_type: String
        amounts: Float
        status: Boolean
        priority: String
        total_qty: Int
        due: Float
        remark: String
    }

    type PurchaseProductDetails {
        product_details: Product
        qty: Int
    }

    input PurchaseProductDetailsInput {
        product_details: ID
        qty: Int
        unit_price: Float
    }

    input PurchaseInput {
        supplier_details: ID
        products_lists: [PurchaseProductDetailsInput]
        date: Date
        product_type: String
        amounts: Float
        status: Boolean
        priority: String
        total_qty: Int
        due: Float
        remark: String
    }

    type Query {
        getPurchases(page: Int, limit: Int, search: String): [Purchase]
    }

    type Mutation {
        createPurchase(data: PurchaseInput): Response!
    }
`

export default purchase