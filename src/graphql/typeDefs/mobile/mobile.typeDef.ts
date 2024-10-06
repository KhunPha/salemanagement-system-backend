// schema.js
const { gql } = require('apollo-server-express');

const mobile = gql`
  type UserExpoPush {
    id: ID!
    user_id: User
    username: String!
    expoPushToken: String!
  }

  type Mutation {
    registerPushToken(username: String!, expoPushToken: String!): UserExpoPush
    sendUserNotification(username: String!, title: String!, body: String!): Boolean
    logoutMobileUser(user_id: ID!, expoPushToken: String): ResponseMessage!
  }
`;

export default mobile
