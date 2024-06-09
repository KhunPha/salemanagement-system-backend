import { gql } from "apollo-server-express";

const supplier = gql`
    type Supplier {
        _id: String,
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

    input SupplierId {
        id: String
    }

    type Query {
        getSuppliers: [Supplier]
    }

    type Mutation {
        createSupplier(data: SupplierInput): [Supplier]
        updateSupplier(id: SupplierId, data: SupplierInput): Supplier
        deleteSupplier(id: SupplierId): Supplier
    }
`

export default supplier