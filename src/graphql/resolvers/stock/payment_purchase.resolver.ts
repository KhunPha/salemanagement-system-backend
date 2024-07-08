import verify from "../../../helper/verifyToken.helper"
import PaymentPurchaseSchema from "../../../schema/stock/payment_purchase.schema"
import { ApolloError } from "apollo-server-express"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const payment_purchase = {
    Query: {
        getPaymentPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                return await PaymentPurchaseSchema.find({ id }).populate("bank")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        paymentPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newpaymentpurchase = new PaymentPurchaseSchema({
                    ...args.input
                })

                await newpaymentpurchase.save()

                if (!newpaymentpurchase) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default payment_purchase