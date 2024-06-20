import { gql } from "apollo-server-express";

const responsemessage = gql`
    type Respone {
        message_en: String
        message_kh: String
        status: Boolean
    }
`

export default responsemessage