import { gql } from "apollo-server-express";

const sales = gql`
    scalar Date

    type Pay {
        dollar: Float
        reil: Float
    }

    type PayBack {
        dollar: Float
        reil: Float
    }

    type Sales {
        _id: ID!
        invoice_number: String
        product_lists: [ProductList]
        cashier: String
        customer: Customer
        paymethod: String
        total_qty: Int
        total_amount: Float
        exchange_rate: Float
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: Pay
        due: Float
        bank: Bank
        total_pay: Float
        total_price: Float
        payback: Float
        createdBy: User
        modifiedBy: User
        createdAt: Date
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

    input PayBackInput {
        dollar: Float
        reil: Float
    }

    input SalesInput {
        invoice_number: String
        product_lists: [ProductListInput]
        paymethod: String
        customer: ID
        total_qty: Int
        total_amount: Float
        exchange_rate: Float
        discount: Float
        remind_status: Boolean
        date_remind: Date
        pay: PayInput
        bank: ID
        total_price: Float
        isSuspend: Boolean
    }

    type PaymentTransacSale {
        sale_id: ID
        pay: Pay
        payment_method: String
        bank: Bank
        payback: PayBack
        createdAt: Date
    }

    input PaymentTransacSaleInput {
        sale_id: ID
        payment_method: String
        pay: PayInput
        bank: ID
        payback: PayBackInput
        remind_status: Boolean
        date_remind: Date
    }

    type Query {
        getSales(page: Int, limit: Int, pagination: Boolean, keyword: String, customer: ID, pay_status: String): SalesPagination
        getSaleSuspend(page: Int, limit: Int, pagination: Boolean, keyword: String): SalesPagination
        getInvoiceNumber: String
        getSalePayment(sale_id: ID): [PaymentTransacSale]
    }

    type Mutation {
        createSales(input: SalesInput): ResponseMessage!
        salePayment(input: PaymentTransacSaleInput): ResponseMessage!
        clearSaleSuspend(id: ID): ResponseMessage!
        voidSalePayment(payment_id: ID): ResponseMessage!
    }
`
export default sales