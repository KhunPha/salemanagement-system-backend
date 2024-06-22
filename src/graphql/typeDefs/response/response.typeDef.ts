import { gql } from "apollo-server-express";

const responsemessage = gql`
    type Response {
        message_en: String
        message_kh: String
        status: Boolean
    }

    type ResponseLogin {
        message_en: String
        message_kh: String
        status: Boolean
        token: String
    }
`

export default responsemessage