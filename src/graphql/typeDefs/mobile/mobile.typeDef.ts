// graphql/schema.ts
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type DeviceSession {
    _id: ID!
    companyId: ID!
    employeeId: ID
    userId: ID
    expoToken: String!
    brand: String
    model: String
    os: String
    version: String
    lastActive: String
    lastLogin: String
    isVerify: Boolean
  }

  type Query {
    getDeviceSessions(employeeIds: [ID!]): [DeviceSession!]!
  }

  type Mutation {
    saveExpoToken(
      employeeId: ID!
      expoToken: String!
      brand: String
      model: String
      os: String
      version: String
    ): DeviceSession!
    
    sendNotification(
      employeeIds: [ID!]
      title: String!
      body: String!
      navigateId: String
      type: String
    ): String
  }
`;
