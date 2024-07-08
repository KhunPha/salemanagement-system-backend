import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import TransferInSchema from "../../../schema/stock/transfer_in.schema"
import { message, messageError } from "../../../helper/message.helper"

const transferin = {
    Query: {
        getTransferIns: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await TransferInSchema.find().populate(["product_details", "supplier_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferIn: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newtransferin = new TransferInSchema({
                    ...args.input
                })

                await newtransferin.save()

                if(!newtransferin){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default transferin