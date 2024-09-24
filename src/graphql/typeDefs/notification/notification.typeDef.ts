import { gql } from "apollo-server-express";

const notification = gql`
    type Notification {
        _id: ID
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
        getNotificationNotRead: [Notification]
        getCountNotification: Int
    }

    type Mutation {
        readNotification(notification_id: ID): Boolean
    }
`

export default notification