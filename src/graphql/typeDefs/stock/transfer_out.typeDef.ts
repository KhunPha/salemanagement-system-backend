import { gql } from "apollo-server-express";

const transferout = gql`
    type TransferOut {
        product_details: Product
        supplier_details: Supplier
        qty: Int
        remark: String
    }

    input TransferOutInput {
        product_details: ID
        supplier_details: ID
        qty: Int
        remark: String
    }

    type Query {
        getTransferOuts(page: Int, limit: Int, search: String): [TransferOut]
    }

    type Mutation {
        TransferOut(input: TransferOutInput): ResponseMessage!
    }
`

export default transferout