import { gql } from "apollo-server-express";

const secondhand = gql`
    type SecondHand {
        _id: ID
        grade_name: String
        price: Float
        barcode: String
        remark: String
    }

    input SecondHandInput {
        grade_name: String
        price: Float
        barcode: String
        remark: String
    }

    type Query {
        getSecondHands(page: Int, limit: Int, keyword: String): [SecondHand]
    }

    type Mutation {
        createSecondHand(input: SecondHandInput): Response!
        updateSecondHand(id: ID, input: SecondHandInput): Response!
        deleteSecondHand(id: ID): Response!
    }
`

export default secondhand