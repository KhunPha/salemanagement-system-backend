import { gql } from "apollo-server-express";

const slicesecondhandhistory = gql`
    type SliceSecondHand {
        _id: ID
        product_id: ID
        grade_details: SecondHand
        qty: Int
        price: Float
    }

    input SliceSecondHandInput {
        product_id: ID
        grade_details: ID
        qty: Int
        price: Float
    }

    type Query {
        getSecondHandSliceHistories(id: ID): [SliceSecondHand]
    }

    type Mutation {
        SliceSecondHand(data: SliceSecondHandInput): SliceSecondHand
    }
`

export default slicesecondhandhistory