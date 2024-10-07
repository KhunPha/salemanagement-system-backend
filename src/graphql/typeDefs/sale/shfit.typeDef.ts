import { gql } from "apollo-server-express";

const shift = gql`
    type Shift {
        deposit_money: [DepositMoney]
        isOpen: Boolean
        shift: String
        createdAt: Date
    }

    type DepositMoney {
        dollars: Float
        riels: Float
    }

    input ShiftInput {
        deposit_money: [DepositMoneyInput]
    }

    input DepositMoneyInput {
        dollars: Float
        riels: Float
    }

    type Query {
        getShifts: Shift
    }

    type Mutation {
        openShift(input: ShiftInput): ResponseMessage!
        closeShift(id: ID): ResponseMessage
    }
`

export default shift