import { ApolloError } from "apollo-server-express"
import PaymentTransacPurSchema from "../../../model/stock/paymentTransacPur.model"

const paymentTransacPur = {
    Query: {
        getPaymentTransacPur: async (parent: any, args: any, context: any) => {
            try {
                const { purchase_id } = args;

                return await PaymentTransacPurSchema.find({ purchase_id });
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default paymentTransacPur