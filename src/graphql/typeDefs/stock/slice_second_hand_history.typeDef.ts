import { gql } from "apollo-server-express";

const slicesecondhandhistory = gql`
    type SliceSecondHand {
        _id: ID
        grade_details: SecondHand
        qty: Int
    }

    input SliceSecondHandInput {
        grade_details: ID
        qty: Int
    }

    type Query {
        getSecondHandSliceHistories(id: ID): [SliceSecondHand]
    }

    type Mutation {
        SliceSecondHand(input: [SliceSecondHandInput]): ResponseMessage!
    }
`

export default slicesecondhandhistory