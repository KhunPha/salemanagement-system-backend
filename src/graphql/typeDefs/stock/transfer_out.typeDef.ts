import { gql } from "apollo-server-express";

const transferout = gql`
    type TransferOut {
        product_lists: [Products]
        supplier_details: Supplier
        date: Date
        total_qty: Int
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

    type TransferOutPagination {
        data: [TransferOut]
        paginator: Paginator
    }

    input TransferOutInput {
        product_lists: [ProductsInputTranferOut]
        supplier_details: ID
        date: Date
        remark: String
    }

    input ProductsInputTranferOut {
        product_details: ID,
        qty: Int,
        price: Float
    }

    type Query {
        getTransferOuts(page: Int, limit: Int, pagination: Boolean): TransferOutPagination
    }

    type Mutation {
        TransferOut(input: TransferOutInput): ResponseMessage!
    }
`

export default transferout