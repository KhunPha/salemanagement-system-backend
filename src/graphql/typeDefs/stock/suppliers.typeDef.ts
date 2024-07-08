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

    type SupplierPagination {
        data: [Supplier]
        paginator: Paginator
    }

    input SupplierInput {
        supplier_name: String,
        phone_number: String,
        email: String,
        address: String,
        remark: String
    }

    type Query {
        getSuppliers(page: Int, limit: Int, pagination: Boolean, keyword: String): [SupplierPagination]
    }

    type Mutation {
        createSupplier(input: SupplierInput): Response!
        updateSupplier(id: ID, input: SupplierInput): Response!
        deleteSupplier(id: ID): Response!
    }
`

export default supplier