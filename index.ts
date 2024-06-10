import express, { Request, Response, NextFunction } from "express"
import { ApolloServer } from "apollo-server-express"
const {success, error} = require("consola")
import dotenv from "dotenv"
import bodyParser from "body-parser"
import { typeDefs, resolvers } from "./src/graphql"
const os = require("os")
const app: any = express()

var ip_address: any;

if(os.networkInterfaces()['Ethernet']){
    ip_address = os.networkInterfaces()['Ethernet'][1]['address']
}else{
    ip_address = os.networkInterfaces()['Wi-Fi'][1]['address']
}

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
            success({
                badge: true,
                message: `Server running on http://${ip_address}:${PORT}${apolloServer.graphqlPath}`
            })
        })

    } catch (err: any) {
        error({
            badge: true,
            message: err.message
        })
    }
}

startServer()