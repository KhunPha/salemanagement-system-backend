import { gql } from "apollo-server-express";

const supplier = gql`
    scalar Upload

    type Supplier {
        _id: ID,
        supplier_name: String,
        phone_number: String,
        email: String,
        address: String,
        remark: String
        createdBy: User
        modifiedBy: User
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
        getSuppliers(page: Int, limit: Int, pagination: Boolean, keyword: String): SupplierPagination
        getSupplierRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): SupplierPagination
    }

    type Mutation {
        createSupplier(input: SupplierInput): ResponseMessage!
        updateSupplier(id: ID, input: SupplierInput): ResponseMessage!
        deleteSupplier(id: ID): ResponseMessage!
        importSupplierExcel(file: Upload!): ResponseMessage!
        importSupplierCSV(file: Upload!): ResponseMessage!
        exportSupplierExcel(savePath: String!): ResponseMessage!
        exportSupplierCSV(savePath: String!): ResponseMessage!
        recoverySupplier(id: ID!): ResponseMessage!
        recoveryManySupplier(id: [ID]): ResponseMessage!
        recoverySupplierDelete(id: ID!): ResponseMessage!
        recoverySupplierDeleteMany(id: [ID]): ResponseMessage!
    }
`

export default supplier