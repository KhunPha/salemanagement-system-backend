import { gql } from "apollo-server-express";

const getstocksale = gql`
    type StockSale {
        stocksale: Stock
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

    type StockSalePagination {
        data: [StockSale]
        paginator: Paginator
    }

    type Query {
        getStocksSale(page: Int, limit: Int, pagination: Boolean, keyword: String, category: ID): StockPagination
    }
`

export default getstocksale