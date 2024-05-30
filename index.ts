import express, { Request, Response, NextFunction } from "express"
import { ApolloServer, gql } from "apollo-server-express"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import { typeDefs, resolvers } from "./src/graphql"
const app: any = express()

dotenv.config()
require("./src/util/db")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const PORT = process.env.PORT || 3000

app.use((req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    next();
});

const startServer = async () => {
    try {
        const apolloServer = new ApolloServer({
            typeDefs,
            resolvers
        })
    
        await apolloServer.start()
        apolloServer.applyMiddleware({app, cors: true})
    
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}${apolloServer.graphqlPath}`)
        })
    } catch (error: any) {
        console.log(error.message)
    }
}

startServer()