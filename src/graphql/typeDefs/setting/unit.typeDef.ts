import { gql } from "apollo-server-express";

const unit = gql`
    scalar Upload

    type Unit {
        _id: ID,
        unit_name: String,
        remark: String,
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

    type UnitPagination {
        data: [Unit]
        paginator: Paginator
    }

    input UnitInput {
        unit_name: String,
        remark: String
    }

    type Query {
        getUnits(page: Int, limit: Int, pagination: Boolean, keyword: String): UnitPagination
        getUnitRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): UnitPagination
    }

    type Mutation {
        createUnit(input: UnitInput): ResponseMessage!
        updateUnit(id: ID!, input: UnitInput): ResponseMessage!
        deleteUnit(id: ID!): ResponseMessage!
        importUnitExcel(file: Upload!): ResponseMessage!
        importUnitCSV(file: Upload!): ResponseMessage!
        exportUnitExcel(savePath: String!): ResponseMessage!
        exportUnitCSV(savePath: String!): ResponseMessage!
        recoveryUnit(id: ID!): ResponseMessage!
        recoveryManyUnit(id: [ID]): ResponseMessage!
        recoveryUnitDelete(id: ID!): ResponseMessage!
        recoveryUnitDeleteMany(id: [ID]): ResponseMessage!
    }

    type Subscription {
        unitAdded: Unit
    }
`

export default unit