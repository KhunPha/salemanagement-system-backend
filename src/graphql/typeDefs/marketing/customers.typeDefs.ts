import { gql } from "apollo-server-express";

const customer = gql`
    type Customer {
        _id: String,
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

    input CustomerId {
        id: String
    }

    type Query {
        getCustomers: [Customer]
    }

    type Mutation {
        createCustomer(data: CustomerInput): Customer
        updateCustomer(id: CustomerId, data: CustomerInput): Customer
        deleteCustomer(id: CustomerId): Customer
    }
`

export default customer