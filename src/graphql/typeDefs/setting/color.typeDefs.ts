import { gql } from "apollo-server-express";

const color = gql`
    type Color {
        _id: String
        color_code: String,
        color_name: String,
        remark: String
    }

    input ColorInput {
        color_code: String,
        color_name: String,
        remark: String
    }

    input ColorId {
        id: String
    }

    type Query {
        getColors: [Color]
    }

    type Mutation {
        createColor(data: ColorInput): Color
        updateColor(id: ColorId, data: ColorInput): Color
        deleteColor(id: ColorId): Color
    }
`

export default color