import { ApolloError } from "apollo-server-express";
import { exec } from "child_process";
import verify from "../../../helper/verifyToken.helper";
import { message } from "../../../helper/message.helper";

const restoreMongoDb = {
    Mutation: {
        backupDatabase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const command = `mongodump --uri="mongodb+srv://khunpha:Sopha3305@salemanagement.qbm94iq.mongodb.net/salemanagement?retryWrites=true&w=majority&appName=salemanagement" --out=D:/Backup`;

                // Execute the command
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing command: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Error output: ${stderr}`);
                        return;
                    }
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        restoreDatabase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const directory = 'D:/Backup/salemanagement'

                const command = `mongorestore --uri="mongodb://localhost:27017/salemanagement" --drop ${directory}`;

                console.log(`Running command: ${command}`);

                // Execute the command
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing command: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Error output: ${stderr}`);
                        return;
                    }
                    console.log(`Output: ${stdout}`);
                    console.log('Backup completed successfully.');
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default restoreMongoDb