import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import TransferInSchema from "../../../schema/stock/transfer_in.schema"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../schema/stock/stocks.schema"

const transferin = {
    Query: {
        getTransferIns: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await TransferInSchema.find().populate(["product_lists.products", "supplier_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferIn: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newtransferin = new TransferInSchema({
                    ...args.input
                })

                const transferinproduct_map: any = newtransferin.product_lists

                for (var i = 0; i < transferinproduct_map.length; i++) {
                    const product_id = transferinproduct_map[i].products
                    const getStock = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newtransferin.save()

                    const stockDoc = { $set: { stock_in_hand: getStock.stock_in_hand + transferinproduct_map[i].qty } }

                    await StockSchema.findOneAndUpdate({ product_details: product_id }, stockDoc, { new: true })
                }

                if (!newtransferin) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default transferin