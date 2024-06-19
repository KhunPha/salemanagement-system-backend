import { gql } from "apollo-server-express";

const sales = gql`
    scalar Date

    type Pay {
        reil: Float
        dollar: Float
    }

    type Sales {
        _id: ID!
        product_lists: [ProductList]
        cashier: String
        customer: String
        paymethod: String
        total_qty: Int
        total_amount: Float
        exchange_rate: Float
        discount_type: String
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: Pay
        bank: Bank
        product_add: [ProductAdd]
        unit_product_discount: [UnitProductDiscount]
    }

    input PayInput {
        reil: Float
        dollar: Float
    }

    input SalesInput {
        product_lists: [ProductListInput]
        cashier: String
        customer: String
        paymethod: String
        total_qty: Int
        total_amount: Float
        exchange_rate: Float
        discount_type: String
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: PayInput
        bank: ID
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