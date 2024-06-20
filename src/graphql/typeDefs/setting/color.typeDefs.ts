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
        createColor(data: ColorInput): Respone
        updateColor(id: ID, data: ColorInput): Respone
        deleteColor(id: ID): Respone
    }
`

export default color