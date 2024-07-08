import { gql } from "apollo-server-express";

const bank = gql`
    type Bank {
        _id: ID,
        bank_name: String,
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

    type BankPagination {
        data: [Bank]
        paginator: Paginator
    }

    input BankInput {
        bank_name: String,
        remark: String
    }

    type Query {
        getBankPagination(page:Int, limit: Int, pagination: Boolean, keyword: String): BankPagination
    }

    type Mutation {
        createBank(input: BankInput): Response!
        updateBank(id: ID!, input: BankInput): Response!
        deleteBank(id: ID!): Response!
    }
`

export default bank