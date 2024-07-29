import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import ReceiveProductTransactionSchema from "../../../schema/stock/receive_product_transaction.schema"
import { message } from "../../../helper/message.helper"
import StockSchema from "../../../schema/stock/stocks.schema"

const receiveproduct = {
    Query: {
        getReceiveProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
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
                verify(context.user)
                const newproductreceive = new ReceiveProductTransactionSchema({
                    ...args.input[1]
                })

                await newproductreceive.save()

                const product_map: any = newproductreceive.product_lists

                for (var i = 0; i < product_map.length; i++) {
                    const product_id = product_map[i].products
                    const getStock: any = await StockSchema.findOne({ product_details: product_id })
                    const stockDoc = { $set: { stock_in_hand: getStock.stock_in_hand + product_map[i].qty } }
                    await StockSchema.findOneAndUpdate({ product_details: product_id }, stockDoc, { new: true })
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default receiveproduct