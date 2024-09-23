import { gql } from "apollo-server-express";

const slicesecondhandhistory = gql`
    type SliceSecondHand {
        _id: ID
        grade_lists: [GradeLists]
    }

    type GradeLists {
        grade_details: GradeProductSecondHand
        price: Float
        qty: Int
    }

    input GradeListsInput {
        grade_lists: [SliceSecondHandInput]
    }

    input SliceSecondHandInput {
        grade_details: ID
        price: Float
        qty: Int
    }

    type Query {
        getDividedProductHistory(id: ID): [SliceSecondHand]
    }

    type Mutation {
        DividedProduct(input: GradeListsInput): ResponseMessage!
    }
`

export default slicesecondhandhistory