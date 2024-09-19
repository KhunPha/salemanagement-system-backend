import { gql } from "apollo-server-express";

const notification = gql`
    type Notification {
        name: String
        title: String
        read: Boolean
        image: String
        section: String
        date_condition: Date
        createdAt: Date
    }

    type Query {
        getNotifications: [Notification]
    }
`

export default notification