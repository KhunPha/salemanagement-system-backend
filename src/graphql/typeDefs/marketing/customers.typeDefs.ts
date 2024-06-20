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
        createCustomer(data: CustomerInput): Respone
        updateCustomer(id: ID!, data: CustomerInput): Respone
        deleteCustomer(id: ID!): Respone
    }
`

export default customer