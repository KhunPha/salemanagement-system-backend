import { gql } from "apollo-server-express";

const transferout = gql`
    type TransferOut {
        product_lists: [Products]
        supplier_details: Supplier
        remark: String
        createdBy: User
        modifiedBy: User
    }

    type Products {
        product_details: Product
        qty: Int
    }

    input TransferOutInput {
        product_lists: [ProductsInputTranferOut]
        supplier_details: ID
        remark: String
    }

    input ProductsInputTranferOut {
        product_details: ID,
        qty: Int
    }

    type Query {
        getTransferOuts(page: Int, limit: Int, search: String): [TransferOut]
    }

    type Mutation {
        TransferOut(input: TransferOutInput): ResponseMessage!
    }
`

export default transferout