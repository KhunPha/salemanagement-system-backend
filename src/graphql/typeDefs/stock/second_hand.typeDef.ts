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
        getSecondHands(page: Int, limit: Int, search: String): [SecondHand]
    }

    type Mutation {
        createSecondHand(data: SecondHandInput): Response
        updateSecondHand(id: ID, data: SecondHandInput): Response
        deleteSecondHand(id: ID): Response
    }
`

export default secondhand