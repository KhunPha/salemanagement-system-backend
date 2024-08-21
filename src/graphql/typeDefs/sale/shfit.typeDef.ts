import { gql } from "apollo-server-express";

const shift = gql`
    type Shift {
        deposit_money: [DepositMoney]
        shfit: String
        date: Int
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
        getShifts: [Shift]
    }

    type Mutation {
        openShift(input: ShiftInput): ResponseMessage!
        closeShift: ResponseMessage
    }
`

export default shift