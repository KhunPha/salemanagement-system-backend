import { gql } from "apollo-server-express";

const unit = gql`
    type Unit {
        _id: ID,
        unit_name: String,
        remark: String
    }

    input UnitInput {
        unit_name: String,
        remark: String
    }

    type Query {
        getUnits(page: Int, limit: Int, search: String): [Unit]
    }

    type Mutation {
        createUnit(data: UnitInput): Respone
        updateUnit(id: ID!, data: UnitInput): Respone
        deleteUnit(id: ID!): Respone
    }
`

export default unit