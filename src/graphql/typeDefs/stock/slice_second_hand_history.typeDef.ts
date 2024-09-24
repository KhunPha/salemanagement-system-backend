import { gql } from "apollo-server-express";

const slicesecondhandhistory = gql`
    type SliceSecondHand {
        _id: ID
        grade_lists: [GradeLists]
        unit_divided: Int
        total_qty: Int
        total_amount: Float
        remark: String
        createdAt: Date
    }

    type GradeLists {
        grade_details: GradeProductSecondHand
        price: Float
        qty: Int
    }

    input GradeListsInput {
        grade_lists: [SliceSecondHandInput]
        unit_divided: Int
        remark: String
    }

    input SliceSecondHandInput {
        grade_details: ID
        price: Float
        qty: Int
    }

    type Query {
        getDividedProductHistory(divided_id: ID): [SliceSecondHand]
    }

    type Mutation {
        DividedProduct(divided_id: ID, input: GradeListsInput): ResponseMessage!
    }
`

export default slicesecondhandhistory