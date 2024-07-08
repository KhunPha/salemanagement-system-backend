import { gql } from "apollo-server-express";

const stock = gql`
    type Stock {
        _id: ID
        product_details: Product
        stock_in_hand: Int
        discount: Float
        cost: Float
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

    type StockPagination {
        data: [Stock]
        paginator: Paginator
    }

    input StockInput {
        product_details: ID
        stock_in_hand: Int
        discount: Float
        cost: Float
    }

    type Query {
        getStocks(page: Int, limit: Int, pagination: Boolean, keyword: String): [StockPagination]
    }

    type Mutation {
        updateStock(id: ID, input: StockInput): Response!
    }
`

export default stock