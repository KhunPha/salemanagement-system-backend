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
        createColor(data: ColorInput): Color
        updateColor(id: ID, data: ColorInput): Color
        deleteColor(id: ID): Color
    }
`

export default color