import { gql } from "apollo-server-express";

const bank = gql`
    type Bank {
        _id: ID,
        bank_name: String,
        remark: String
    }

    type Paginator {
        totalDocs: Int
        offset: Int
        limit: Int
        totalPages: Int
        page: Int
        pagingCounter: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
        prevPage: Int
        nextPage: Int
    }

    type BankPagination {
        data: [Bank]
        paginator: Paginator
    }

    input BankInput {
        bank_name: String,
        remark: String
    }

    type Query {
        getBanks: BankPagination
    }

    type Mutation {
        createBank(data: BankInput): Response!
        updateBank(id: ID!, data: BankInput): Response!
        deleteBank(id: ID!): Response!
    }
`

export default bank