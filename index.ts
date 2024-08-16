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

const TelegramBot = require("node-telegram-bot-api")
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
app.use('/public', express.static(path.join(__dirname, 'public')));

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
                subscribe
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

// Replace with your Telegram bot token
const botToken = '6982086313:AAHYKBg8AexdmsEoDiIYcu6HLN2BIWCsr50';

// Create a bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Handle new chat members and group updates
bot.on('message', (msg: any) => {
    const chat = msg.chat;

    // Check if the chat type is 'group' or 'supergroup'
    if (chat.type === 'group' || chat.type === 'supergroup') {
        console.log('Group ID:', chat.id);
        console.log('Group Name:', chat.title || 'Unnamed');
    }
});

// Handle the /start command
bot.onText(/\/start/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! This bot is now active in this group.');
    console.log('Received /start in chat:', chatId);
});

bot.onText(/\/hi/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello My friend welcome to my channel')
})

bot.onText(/\/myid/, (msg: any) => {
    const chatId = msg.chat.id;
    if(msg.chat.type == 'group'){
        bot.sendMessage(chatId, 'Your cannot check your id in group please chat to me @testme33bot')
    }else{
        bot.sendMessage(chatId, `Your chat id: ${chatId}`)
    }
})

bot.onText(/\/groupid/, (msg: any) => {
    const chatId = msg.chat.id;
    if(msg.chat.type == 'group'){
        bot.sendMessage(chatId, `Your group id: ${chatId}`)
    }else {
        bot.sendMessage(chatId, 'Your not in group')
    }
})

export default bot
