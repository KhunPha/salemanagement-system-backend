import verify from "../../../helper/verifyToken.helper"
import PaymentPurchaseSchema from "../../../model/stock/payment_purchase.model"
import { ApolloError } from "apollo-server-express"
import { message, messageError, messageLogin } from "../../../helper/message.helper"

const payment_purchase = {
    Query: {
        getPaymentPurchases: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = await args

                return await PaymentPurchaseSchema.find({ id }).populate("bank createdBy modifiedBy")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        paymentPurchase: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)

                const newpaymentpurchase = new PaymentPurchaseSchema({
                    ...args.input,
                    createdBy: userToken._id,
                    modifiedBy: userToken._id
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