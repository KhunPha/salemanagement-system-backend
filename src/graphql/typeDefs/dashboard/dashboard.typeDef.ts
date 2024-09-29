import { gql } from "apollo-server-express";

const dashboard = gql`
    type Dashboard {
        totalSales: Int
        revenueInDashboard: Float
        expenseInDashboard: Float
        profitInDashboard: Float
    }
    
    type AnnualSales {
        January: Int
        February: Int
        March: Int
        April: Int
        May: Int
        June: Int
        July: Int
        August: Int
        September: Int
        October: Int
        November: Int
        December: Int
    }

    type MonthlySales {
        data: [Top]
    }

    type Top {
        pro_name: String
        qty: Int
    }

    type Query {
        topDashboard: Dashboard
        annualSalesInDashboard(year: Date): AnnualSales
        monthlySalesItemsInDashboard(month: Date): MonthlySales
    }
`

export default dashboard