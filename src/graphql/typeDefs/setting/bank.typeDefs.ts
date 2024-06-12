import { gql } from "apollo-server-express";

const bank = gql`
    type Bank {
        _id: ID,
        bank_name: String,
        remark: String
    }

    input BankInput {
        bank_name: String,
        remark: String
    }

    type Query {
        getBanks: [Bank]
    }

    type Mutation {
        createBank(data: BankInput): Bank
        updateBank(id: ID!, data: BankInput): Bank
        deleteBank(id: ID!): Bank
    }
`

export default bank