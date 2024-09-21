import { gql } from "apollo-server-express";

const aboutsystem = gql`
    scalar Upload

    type AboutSystem {
        title: String
        description: String
        video_url: String
        publicId: String
        section: String
    }

    input AboutSystemInput {
        title: String
        description: String
        video_url: String
        publicId: String
        section: String
    }

    type videoUpload {
        url: String,
        publicId: String,
        status: Boolean
    }

    type Query {
        getAboutSystem(section: String): [AboutSystem] 
    }

    type Mutation {
        uploadVideoAboutSystem(file: Upload!): videoUpload
        deleteVideoAboutSystem(publicId: String): Boolean
        createAboutSystem(input: AboutSystemInput): ResponseMessage!
        deleteAboutSystem(id: ID!): ResponseMessage!
    }
`

export default aboutsystem