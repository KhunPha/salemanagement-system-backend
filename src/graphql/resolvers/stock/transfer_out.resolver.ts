import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import TransferOutSchema from "../../../schema/stock/transfer_out.schema"
import { message, messageError } from "../../../helper/message.helper"

const transferout = {
    Query: {
        getTransferOuts: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await TransferOutSchema.find().populate(["product_details", "supplier_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferOut: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newtransferout = new TransferOutSchema({
                    ...args.data
                })

                await newtransferout.save()

                if(!newtransferout){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default transferout