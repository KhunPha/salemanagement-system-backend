import { gql } from "apollo-server-express";

const ResponseMessage = gql`
    type ResponseMessage {
        message_en: String
        message_kh: String
        status: Boolean
    }

    type ResponseMessageLogin {
        message_en: String
        message_kh: String
        status: Boolean
        token: String
        sessionId: String
    }

    type ResponseMessageMobileLogin {
        user_data: User
        message_en: String
        message_kh: String
        status: Boolean
    }
`

export default ResponseMessage