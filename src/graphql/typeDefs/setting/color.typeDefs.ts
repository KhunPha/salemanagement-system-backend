import { gql } from "apollo-server-express";

const color = gql`
    type Color {
        _id: ID
        color_code: String,
        color_name: String,
        remark: String
    }

    input ColorInput {
        color_code: String,
        color_name: String,
        remark: String
    }

    type Query {
        getColors: [Color]
    }

    type Mutation {
        createColor(data: ColorInput): Response
        updateColor(id: ID, data: ColorInput): Response
        deleteColor(id: ID): Response
    }
`

export default color