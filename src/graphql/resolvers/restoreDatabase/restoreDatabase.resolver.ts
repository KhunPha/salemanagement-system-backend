import { ApolloError } from "apollo-server-express";
import { exec } from "child_process";
import verify from "../../../helper/verifyToken.helper";
import { message } from "../../../helper/message.helper";

const restoreMongoDb = {
    Mutation: {
        restoreDatabase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const command = `docker cp D:/Backup 51ef6c58075ce4a5c47fb063b1260f7e1f6720b1728486872c46b3adef21f0fd:/backup`;

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
        backupDatabase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const command = `docker cp 51ef6c58075ce4a5c47fb063b1260f7e1f6720b1728486872c46b3adef21f0fd:/backup D:/Backup`;

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