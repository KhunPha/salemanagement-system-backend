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

    input CustomerInput {
        customer_name: String,
        phone_number: String,
        email: String,
        types: String,
        remark: String
    }

    type Query {
        getCustomers: [Customer]
    }

    type Mutation {
        createCustomer(data: CustomerInput): Customer
        updateCustomer(id: ID!, data: CustomerInput): Customer
        deleteCustomer(id: ID!): Customer
    }
`

export default customer