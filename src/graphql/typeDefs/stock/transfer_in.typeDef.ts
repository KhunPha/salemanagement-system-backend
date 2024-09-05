import { gql } from "apollo-server-express";

const transferin = gql`
    type TransferIn {
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

    input TransferInInput {
        product_lists: [ProductsInputTranferIn]
        supplier_details: ID
        remark: String
    }

    input ProductsInputTranferIn {
        product_details: ID
        qty: Int
    }

    type Query {
        getTransferIns(page: Int, limit: Int, search: String): [TransferIn]
    }

    type Mutation {
        TransferIn(input: TransferInInput): ResponseMessage!
    }
`

export default transferin