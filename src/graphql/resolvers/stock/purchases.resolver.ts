import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import PurchaseSchema from "../../../schema/stock/purchases.schema"
import {message, messageLogin} from "../../../helper/message.helper"

const purchase = {
    Query: {
        getPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await PurchaseSchema.find().populate(["supplier_details", "product_lists"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
    },
    Mutation: {
        createPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newpurchase = new PurchaseSchema({
                    ...args.data
                })

                await newpurchase.save()

                if (!newpurchase) {
                    throw new ApolloError("Purchase failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default purchase