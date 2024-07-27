import { gql } from "apollo-server-express";

const purchase = gql`
    scalar Date

    type Purchase {
        _id: ID
        supplier_details: Supplier
        products_lists: [PurchaseProductDetails]
        date: Date
        product_type: String
        amounts: Float
        isVoid: Boolean
        total_qty: Int
        due: Float
        remark: String
    }

    type PurchaseProductDetails {
        product_details: Product
        qty: Int
        unit_price: Float
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

    type PurchasePagination {
        data: [Purchase]
        paginator: Paginator
    }

    input PurchaseProductDetailsInput {
        product_details: ID
        qty: Int
        unit_price: Float
    }

    input PurchaseInput {
        supplier_details: ID
        products_lists: [PurchaseProductDetailsInput]
        date: Date
        product_type: String
        amounts: Float
        total_qty: Int
        due: Float
        remark: String
    }

    type Query {
        getPurchases(page: Int, limit: Int, pagination: Boolean, keyword: String): PurchasePagination
    }

    type Mutation {
        createPurchase(input: PurchaseInput): ResponseMessage!
        voidPurchase(id: ID): ResponseMessage
    }
`

export default purchase