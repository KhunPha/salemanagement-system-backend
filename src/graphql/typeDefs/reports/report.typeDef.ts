import { gql } from "apollo-server-express";

const report = gql`

    type DailyReport {
        pro_name: String
        type_of_product: String
        qty: Int
    }

    type SalesReport {
        pro_name: String
        amount: Float
        qty: Int
    }

    type PurchaseReport {
        pro_name: String
        qty: Int
        receive: Int
        amount: Float
    }

    type InvoiceReport {
        invoice_number: String
        createdAt: Date
        customer: String
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
        price: Float
        discount: Float
        cost: Float
        amount: Float
    }

    type RevenueReport {
        pro_name: String
        qty: Int
        amount: Float
    }

    type ExpenseReport {
        pro_name: String
        qty: Int
        amount: Float
    }

    type DailyReportData {
        data: [DailyReport]
        total_qty: Int
    }

    type SaleReportData {
        data: [SalesReport]
        total_qty: Int
        total_amount: Float
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
        total: Float
    }

    type Query {
        dailyReport(from_date: Date, to_date: Date): DailyReportData
        salesReport(from_date: Date, to_date: Date): SaleReportData
        purchaseReport(from_date: Date, to_date: Date): PurchaseReportData
        invoiceSaleReport(from_date: Date, to_date: Date): InvoiceReportData
        revenueReport(from_date: Date, to_date: Date): RevenueReportData
        expenseReport(from_date: Date, to_date: Date): ExpenseReportData
        stockReport(type_of_product: String): StockReportData
    }
`

export default report