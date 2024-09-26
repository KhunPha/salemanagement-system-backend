import { gql } from "apollo-server-express";

const report = gql`

    type DailyReport {
        pro_name: String
        type_of_product: String
        qty: Int
        cost: Float
        profit: Float
    }

    type SalesReport {
        pro_name: String
        sale_amount: Float
        cost: Float
        profit: Float
        qty: Int
    }

    type PurchaseReport {
        date: Date
        pro_name: String
        qty: Int
        receive: Int
        amount: Float
    }

    type InvoiceReport {
        invoice_number: String
        createdAt: Date
        customer: Customer
        cashier: String
        total_qty: Int
        discount: Float
        total_price: Float
        total_amount: Float
        due: Float
    }

    type StockReport {
        product_details: Product
        stock_on_hand: Int
        type_of_product: String
        price: Float
        discount: Float
        cost: Float
        amount: Float
    }

    type RevenueReport {
        date: Date
        pro_name: String
        qty: Int
        total_price: Float
    }

    type ExpenseReport {
        date: Date
        pro_name: String
        qty: Int
        total_price: Float
    }

    type DailyReportData {
        data: [DailyReport]
        total_qty: Int
        total_cost: Float
        total_profit: Float
    }

    type SaleReportData {
        data: [SalesReport]
        total_qty: Int
        total_amount: Float
        total_profit: Float
    }

    type PurchaseReportData {
        data: [PurchaseReport]
        total_qty: Int 
        total_receive: Int 
        total_amount: Float
    }

    type InvoiceReportData {
        data: [InvoiceReport]
        total_invoice: Int
    }

    type RevenueReportData {
        data: [RevenueReport]
        total_qty: Int
        total_amount: Float
    }

    type ExpenseReportData {
        data: [ExpenseReport]
        total_qty: Int
        total_amount: Float
    }

    type StockReportData {
        data: [StockReport],
        total_amount: Float
    }

    type Query {
        dailyReport: DailyReportData
        salesReport(from_date: Date, to_date: Date): SaleReportData
        purchaseReport(from_date: Date, to_date: Date): PurchaseReportData
        invoiceSaleReport(from_date: Date, to_date: Date, customer: ID): InvoiceReportData
        revenueReport(from_date: Date, to_date: Date): RevenueReportData
        expenseReport(from_date: Date, to_date: Date): ExpenseReportData
        stockReport(type_of_product: String): StockReportData
    }
`

export default report