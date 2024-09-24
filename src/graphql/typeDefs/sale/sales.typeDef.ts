import { gql } from "apollo-server-express";

const sales = gql`
    scalar Date

    type Pay {
        dollar: Float
        reil: Float
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
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: Pay
        bank: Bank
        createdBy: User
        modifiedBy: User
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
        dollar: Float
        reil: Float
    }

    input SalesInput {
        product_lists: [ProductListInput]
        paymethod: String
        customer: String
        total_qty: Int
        total_amount: Float
        exchange_rate: Float
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: PayInput
        bank: ID
        isSuspend: Boolean
    }

    type Query {
        getSales(page: Int, limit: Int, pagination: Boolean, keyword: String): SalesPagination
        getSaleSuspend(page: Int, limit: Int, pagination: Boolean, keyword: String): SalesPagination
        getInvoiceNumber: String
    }

    type Mutation {
        createSales(input: SalesInput): ResponseMessage!
        updateSales(id: ID, input: SalesInput): ResponseMessage!
        deleteSales(id: ID): ResponseMessage!
    }
`
export default sales