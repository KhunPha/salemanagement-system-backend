import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ReceiveProductTransactionSchema from "../../../model/stock/receive_product.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

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

                const newproductreceive = new ReceiveProductTransactionSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const product_map: any = newproductreceive.product_lists

                for (var i = 0; i < product_map.length; i++) {
                    const product_id = product_map[i].products
                    const getStock: any = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newproductreceive.save()

                    if (args.input.product_unit_type === "Whole") {
                        stockDoc = { $set: { stock_in_hand: getStock.stock_in_hand + product_map[i].whole } }
                    } else {
                        stockDoc = { $set: { stock_in_hand: getStock.stock_in_hand + (product_map[i].retail_in_whole * product_map[i].whole) } }
                    }

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