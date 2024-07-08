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

    type Paginator {
        slNo: Int
        prev: Int
        next: Int
        perPage: Int
        totalPosts: Int
        totalPages: Int
        currentPage: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
        totalDocs: Int
    }

    type SalesPagination {
        data: [Sales]
        paginator: Paginator
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
        getSales(page: Int, limit: Int, pagination: Boolean, keyword: String): SalesPagination
    }

    type Mutation {
        createSales(input: SalesInput): Response!
        updateSales(id: ID, input: SalesInput): Response!
        deleteSales(id: ID): Response!
    }
`
export default sales