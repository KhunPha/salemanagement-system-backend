import { gql } from "apollo-server-express";

const transferin = gql`
    type TransferIn {
        product_lists: [Products]
        supplier_details: Supplier
        date: Date
        total_qty: Int
        total_price: Float
        remark: String
        createdBy: User
        modifiedBy: User
    }

    type Products {
        product_details: Product
        qty: Int
        price: Float
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

    type TransferInPagination {
        data: [TransferIn]
        paginator: Paginator
    }

    input TransferInInput {
        product_lists: [ProductsInputTranferIn]
        supplier_details: ID
        date: Date
        remark: String
    }

    input ProductsInputTranferIn {
        product_details: ID
        qty: Int
        price: Float
    }

    type Query {
        getTransferIns(page: Int, limit: Int, pagination: Boolean): TransferInPagination
    }

    type Mutation {
        TransferIn(input: TransferInInput): ResponseMessage!
    }
`

export default transferin