import { gql } from "apollo-server-express";

const restoreMongoDb = gql`
    type Mutation {
        restoreDatabase(path: String): ResponseMessage!
        backupDatabase(path: String): ResponseMessage!
    }    
`

export default restoreMongoDb