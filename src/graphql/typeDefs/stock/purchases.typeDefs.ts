import { gql } from "apollo-server-express";

const purchase = gql`
    scalar Date

    type Purchase {
        _id: ID
        supplier_details: Supplier
        products_lists: [Product]
        date: Date
        product_type: String
        amounts: Float
        status: Boolean
        priority: String
        total_qty: Int
        due: Float
        remark: String
    }

    input PurchaseInput {
        supplier_details: ID
        products_lists: [ID]
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
        createPurchase(data: PurchaseInput): Respone
    }
`

export default purchase