import express, { Request, Response, NextFunction } from "express"
import { ApolloServer } from "apollo-server-express"
const { success, error } = require("consola")
import { graphqlUploadExpress } from "graphql-upload-ts"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import http from "http"
import { execute, subscribe } from "graphql"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { typeDefs, resolvers } from "./src/graphql"

const os = require("os")
const app: any = express()

var ip_address: any;

if (os.networkInterfaces()['Ethernet']) {
    ip_address = os.networkInterfaces()['Ethernet'][1]['address']
} else if (os.networkInterfaces()['Wi-Fi']) {
    ip_address = os.networkInterfaces()['Wi-Fi'][1]['address']
} else {
    ip_address = "localhost"
}

dotenv.config()

export var MONGO_URI: any = null

if (ip_address !== "localhost") {
    MONGO_URI = process.env.MONGO_URI
} else {
    MONGO_URI = process.env.MONGO_URI_LOCAL
}

require("./src/util/db")

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000
var client: any = null

app.use((req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    client = clientIp.split("::ffff:")[1]
    next();
});

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

const startServer = async () => {
    try {
        const apolloServer = new ApolloServer({
            schema,
            context: (req) => {
                const user = req;
                return { user, client }
            }
        })

        app.use(graphqlUploadExpress({ maxFieldSize: 10000000, maxFiles: 10 }))

        await apolloServer.start()
        apolloServer.applyMiddleware({ app, cors: true })

        const httpServer = http.createServer(app)

        httpServer.listen(PORT, () => {
            success({
                badge: true,
                message: `Server running on http://${ip_address}:${PORT}${apolloServer.graphqlPath}`
            })
        })

        SubscriptionServer.create(
            {
                schema,
                execute,
                subscribe,
            },
            {
                server: httpServer,
                path: apolloServer.graphqlPath
            }
        )

        success({
            badge: true,
            message: `WebSocket subscriptions ready at ws://${ip_address}:${PORT}${apolloServer.graphqlPath}`
        })

    } catch (err: any) {
        error({
            badge: true,
            message: err.message
        })
    }
}

startServer()
