import { gql } from "apollo-server-express";

const sales = gql`
    type Sales {
        _id: ID!
        product_lists: [ProductList]
        cashier: String
        total_qty: Int
        total_amount: Float
        discount_type: String
        discount: Float
        product_add: [ProductAdd]
        unit_product_discount: [UnitProductDiscount]
    }

    input SalesInput {
        product_lists: [ProductListInput]
        cashier: String
        total_qty: Int
        total_amount: Float
        discount_type: String
        discount: Float
        product_add: [ProductAddInput]
        unit_product_discount: [UnitProductDiscountInput]
    }

    type Query {
        getSales(page: Int, limit: Int, search: String): [Sales]
    }

    type Mutation {
        createSales(data: SalesInput): Sales
        updateSales(id: ID, data: SalesInput): Sales
        deleteSales(id: ID): Sales
    }
`
export default sales