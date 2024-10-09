import express, { Request, Response, NextFunction } from "express"
import { ApolloServer } from "apollo-server-express"
const { success, error } = require("consola")
import { GraphQLUpload, graphqlUploadExpress, Upload } from "graphql-upload-ts"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import http from "http"
import { execute, subscribe } from "graphql"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { typeDefs, resolvers } from "./src/graphql"
import path from "path"
const cookieParser = require('cookie-parser');
const os = require("os")
const app: any = express()

import("./src/util/db")

dotenv.config()

var ip_address: any;

if (os.networkInterfaces()['Ethernet']) {
    ip_address = os.networkInterfaces()['Ethernet'][1]['address']
} else if (os.networkInterfaces()['Wi-Fi']) {
    ip_address = os.networkInterfaces()['Wi-Fi'][1]['address']
} else {
    ip_address = "localhost"
}

export var MONGO_URI: any = null

if (ip_address !== "localhost") {
    MONGO_URI = process.env.MONGO_URI
} else {
    MONGO_URI = process.env.MONGO_URI_LOCAL
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000
var client: any = null

// Handle IP address and store in client variable
app.use((req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    client = clientIp.split("::ffff:")[1] || clientIp;
    next();
});

// Middleware to handle request timeouts (5 seconds)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(5000, () => { // 5 seconds timeout
        console.warn('Request has timed out.');
        res.status(408).send('Request timeout'); // Send timeout response
    });
    next();
});

// Middleware to handle aborted requests
app.use((req: Request, res: Response, next: NextFunction) => {
    req.on('aborted', () => {
        console.warn('Request aborted by the client');
    });
    next();
});

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

const httpServer = http.createServer(app);

const startServer = async () => {
    try {
        const apolloServer = new ApolloServer({
            schema,
            context: (req) => {
                try {
                    const user = req
                    return { user, client }
                } catch (error: any) {
                    throw new ApolloServer(error)
                }
            }
        });

        app.use(graphqlUploadExpress({ maxFieldSize: 10000000, maxFiles: 10 }));

        await apolloServer.start();
        apolloServer.applyMiddleware({ app, cors: true });

        httpServer.listen(PORT, () => {
            success({
                badge: true,
                message: `Server running on http://${ip_address}:${PORT}${apolloServer.graphqlPath}`
            });
        });

        // If you want to use subscriptions, uncomment the following block
        // SubscriptionServer.create(
        //     {
        //         schema,
        //         execute,
        //         subscribe
        //     },
        //     {
        //         server: httpServer,
        //         path: apolloServer.graphqlPath
        //     }
        // )

    } catch (err: any) {
        error({
            badge: true,
            message: err.message
        });
    }
};

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.aborted) {
        console.warn('Request aborted after error occurred.');
    } else {
        console.error('Unhandled Error:', err);
        res.status(500).send('Something broke!');
    }
    process.exit(1); // Optional: This forces a restart, but use with caution
});

startServer();