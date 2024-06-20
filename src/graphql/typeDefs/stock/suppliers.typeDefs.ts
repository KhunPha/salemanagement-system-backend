import { gql } from "apollo-server-express";

const supplier = gql`
    type Supplier {
        _id: ID,
        supplier_name: String,
        phone_number: String,
        email: String,
        address: String,
        remark: String
    }

    input SupplierInput {
        supplier_name: String,
        phone_number: String,
        email: String,
        address: String,
        remark: String
    }

    type Query {
        getSuppliers: [Supplier]
    }

    type Mutation {
        createSupplier(data: SupplierInput): Respone
        updateSupplier(id: ID, data: SupplierInput): Respone
        deleteSupplier(id: ID): Respone
    }
`

export default supplier