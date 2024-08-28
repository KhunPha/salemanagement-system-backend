import { gql } from "apollo-server-express";

const report = gql`
    type SummaryReport {
        message: String
    }

    type DailyReport {
        message: String
    }

    type SalesReport {
        message: String
    }

    type PurchaseReport {
        message: String
    }

    type InvoiceSaleReport {
        message: String
    }

    type StockReport {
        product_details: Product
        stock_on_hand: Int
        price: Float
        discount: Float
        cost: Float
        amount: Float
    }

    type ExpenseReport {
        pro_name: String
        qty: Int
        price: Float
        total: Float
        discount: Float
        amount: Float
    }

    type StockReportData {
        data: [StockReport],
        total: Float
    }

    type ExpenseReportData {
        data: [ExpenseReport]
        total_qty: Int
        total_price: Float
        total_amount: Float
    }

    type Query {
        summaryReport: String
        dailyReport: String
        salesReport: String
        purchaseReport: String
        invoiceSaleReport: String
        revenueReport: String
        expenseReport: ExpenseReportData
        stockReport: StockReportData
    }
`

export default report