import { gql } from "apollo-server-express";

const stock = gql`
    type Stock {
        _id: ID
        product_details: Product
        stock_in_hand: Int
        discount: Float
        cost: Float
    }

    input StockInput {
        product_details: ID
        stock_in_hand: Int
        discount: Float
        cost: Float
    }

    type Query {
        getStocks(page: Int, limit: Int, search: String): [Stock]
    }

    type Mutation {
        updateStock(id: ID, data: StockInput): Response!
    }
`

export default stock