import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ReceiveProductTransactionSchema from "../../../model/stock/receive_product.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"
import PurchaseSchema from "../../../model/stock/purchases.model"
import PaymentTransacPurSchema from "../../../model/stock/paymentTransacPur.model"

const receiveproduct = {
    Query: {
        getReceiveProductTransac: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                return await ReceiveProductTransactionSchema.find({ purchase_id: args.id }).populate({
                    path: "product_lists.products"
                })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        processReceiveProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                let stockDoc;

                const { purchase_id } = args.input

                const newproductreceive = new ReceiveProductTransactionSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const newTransac = new PaymentTransacPurSchema({
                    ...args.input,
                    reil: args.input.pay.reil,
                    dollar: args.input.pay.dollar,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const purchase: any = await PurchaseSchema.findById(purchase_id)

                const total_pay = (args.input.pay.reil / 4000) + args.input.pay.dollar;

                const product_map: any = newproductreceive.product_lists

                for (var i = 0; i < product_map.length; i++) {
                    const product_id = product_map[i].product_details
                    const getStock: any = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newproductreceive.save()

                    await newTransac.save()

                    if (args.input.product_type === "Second Hand") {
                        stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand + product_map[i].whole, isNewInsert: false } }
                    } else {
                        stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand + (product_map[i].retail_in_whole * product_map[i].whole), isNewInsert: false } }
                    }

                    await StockSchema.findOneAndUpdate({ product_details: product_id }, stockDoc, { new: true })

                    await PurchaseSchema.findByIdAndUpdate(purchase_id, { $set: { total_pay: purchase.total_pay + total_pay, remiding_date: args.input.date_notify, due: purchase.amounts - total_pay } })
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default receiveproduct