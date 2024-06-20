import verify from "../../../function/verifyToken.function"
import PaymentPurchaseSchema from "../../../schema/stock/payment_purchase.schema"
import { ApolloError } from "apollo-server-express"

const payment_purchase = {
    Query: {
        getPaymentPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {id} = await args

                return await PaymentPurchaseSchema.find({id}).populate("bank")
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
                    ...args.data
                })

                await newpaymentpurchase.save()

                return newpaymentpurchase.populate("bank")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default payment_purchase