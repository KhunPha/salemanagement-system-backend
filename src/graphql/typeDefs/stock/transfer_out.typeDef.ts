import { gql } from "apollo-server-express";

const transferout = gql`
    type TransferOut {
        product_lists: [Products]
        supplier_details: Supplier
        remark: String
    }

    type Products {
        products: Product
        qty: Int
    }

    input TransferOutInput {
        product_lists: [ProductsInput]
        supplier_details: ID
        remark: String
    }

    input ProductsInput {
        products: ID,
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