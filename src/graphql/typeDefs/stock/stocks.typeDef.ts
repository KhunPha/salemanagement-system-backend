import { gql } from "apollo-server-express";

const stock = gql`
    type Stock {
        _id: ID
        product_details: Product
        stock_on_hand: Int
        discount: Float
        discount_type: String
        discount_id: String
        after_discount: Float
        isDiscount: Boolean
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
        stock_on_hand: Int
    }

    input ProductDiscounts {
        product_id: [ID],
        discount: Float,
        type: String,
        from_date: Date,
        to_date: Date,
        remark: String
    }

    type Query {
        getStocks(page: Int, limit: Int, pagination: Boolean,type_of_product: String, category: ID, keyword: String): StockPagination
    }

    type Mutation {
        discountProduct(input: ProductDiscounts): ResponseMessage!
        clearDiscountOneProduct(id: ID): ResponseMessage!
        clearDiscountAllProduct(id: [ID]): ResponseMessage
    }
`

export default stock