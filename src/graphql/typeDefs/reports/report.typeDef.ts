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
        message: String
    }

    type Query {
        summaryReport: String
        dailyReport: String
        salesReport: String
        purchaseReport: String
        invoiceSaleReport: String
        stockReport: String
    }
`

export default report