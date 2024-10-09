import { ApolloError } from "apollo-server-express"
import PaymentTransacPurSchema from "../../../model/stock/paymentTransacPur.model"
import PurchaseSchema from "../../../model/stock/purchases.model";
import { message } from "telegram/client";

const paymentTransacPur = {
    Query: {
        getPaymentTransacPur: async (parent: any, args: any, context: any) => {
            try {
                const { purchase_id } = args;

                return await PaymentTransacPurSchema.find({ purchase_id, isVoid: { $ne: true } });
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    },
    Mutation: {
        purchasePayment: async (parent: any, args: any, context: any) => {
            try {
                const { purchase_id, dollar, remiding_date, isNotify } = args.input

                const findPurchase: any = await PurchaseSchema.findById(purchase_id);

                const total_pay = findPurchase?.total_pay + dollar;

                await PurchaseSchema.findByIdAndUpdate(purchase_id, { $set: { total_pay, remiding_date, isNotify } });

                await new PaymentTransacPurSchema({
                    ...args.input
                }).save();

                return message;
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        voidPurchasePayment: async (parent: any, args: any, context: any) => {
            try {
                const { payment_id } = args

                const findPurPayment: any = await PaymentTransacPurSchema.findById(payment_id);
                const findPurchase: any = await PurchaseSchema.findById(findPurPayment?._id);

                const updateDoc = { $set: { due: findPurPayment?.dollar + findPurchase?.due, total_pay: findPurchase?.total_pay - findPurPayment?.dollar } };

                await PurchaseSchema.findByIdAndUpdate(findPurchase?._id, updateDoc);

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default paymentTransacPur