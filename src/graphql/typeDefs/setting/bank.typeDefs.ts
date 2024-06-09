import { gql } from "apollo-server-express";

const bank = gql`
    type Bank {
        _id: String,
        bank_name: String,
        remark: String
    }

    input BankInput {
        bank_name: String,
        remark: String
    }

    input BankId {
        id: String
    }

    type Query {
        getBanks: [Bank]
    }

    type Mutation {
        createBank(data: BankInput): Bank
        updateBank(id: BankId, data: BankInput): Bank
        deleteBank(id: BankId): Bank
    }
`

export default bank