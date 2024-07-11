import { gql } from "apollo-server-express";

const transferin = gql`
    type TransferIn {
        product_details: Product
        supplier_details: Supplier
        qty: Int
        remark: String
    }

    input TransferInInput {
        product_details: ID
        supplier_details: ID
        qty: Int
        remark: String
    }

    type Query {
        getTransferIns(page: Int, limit: Int, search: String): [TransferIn]
    }

    type Mutation {
        TransferIn(input: TransferInInput): ResponseMessage!
    }
`

export default transferin