import { gql } from "apollo-server-express";

const customer = gql`
    scalar Upload

    type Customer {
        _id: ID,
        customer_name: String,
        phone_number: String,
        email: String,
        address: String,
        types: String,
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

    type CustomerPagination {
        data: [Customer]
        paginator: Paginator
    }

    input CustomerInput {
        customer_name: String,
        phone_number: String,
        email: String,
        address: String,
        types: String,
        remark: String
    }

    type Query {
        getCustomers(page: Int, limit: Int, pagination: Boolean, keyword: String, types: String): CustomerPagination
        getCustomerRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): CustomerPagination
    }

    type Mutation {
        createCustomer(input: CustomerInput): ResponseMessage!
        updateCustomer(id: ID!, input: CustomerInput): ResponseMessage!
        deleteCustomer(id: ID!): ResponseMessage!
        importCustomerExcel(file: Upload!): ResponseMessage!
        importCustomerCSV(file: Upload!): ResponseMessage!
        exportCustomerExcel(savePath: String!): ResponseMessage!
        exportCustomerCSV(savePath: String!): ResponseMessage!
        recoveryCustomer(id: ID!): ResponseMessage!
        recoveryManyCustomer(id: [ID]): ResponseMessage!
        recoveryCustomerDelete(id: ID!): ResponseMessage!
        recoveryCustomerDeleteMany(id: [ID]): ResponseMessage!
    }
`

export default customer