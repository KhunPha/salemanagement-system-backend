import { gql } from "apollo-server-express";

const customer = gql`
    type Customer {
        _id: ID,
        customer_name: String,
        phone_number: String,
        email: String,
        types: String,
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

    type CustomerPagination {
        data: [Customer]
        paginator: Paginator
    }

    input CustomerInput {
        customer_name: String,
        phone_number: String,
        email: String,
        types: String,
        remark: String
    }

    type Query {
        getCustomers: [CustomerPagination]
    }

    type Mutation {
        createCustomer(input: CustomerInput): Response!
        updateCustomer(id: ID!, input: CustomerInput): Response!
        deleteCustomer(id: ID!): Response!
    }
`

export default customer