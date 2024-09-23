import { gql } from "apollo-server-express";

const report = gql`

    type DailyReport {
        message: String
    }

    type SalesReport {
        message: String
    }

    type PurchaseReport {
        pro_name: String
        qty: Int
        receive: Int
        amount: Float
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
        amount: Float
    }

    type PurchaseReportData {
        data: [PurchaseReport]
        total_qty: Int 
        total_receive: Int 
        total_amount: Float
    }

    type StockReportData {
        data: [StockReport],
        total: Float
    }

    type ExpenseReportData {
        data: [ExpenseReport]
        total_qty: Int
        total_amount: Float
    }

    type Query {
        dailyReport: String
        salesReport: String
        purchaseReport: PurchaseReportData
        invoiceSaleReport: String
        revenueReport: String
        expenseReport: ExpenseReportData
        stockReport: StockReportData
    }
`

export default report