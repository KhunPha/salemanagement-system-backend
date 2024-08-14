import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import TransferOutSchema from "../../../schema/stock/transfer_out.schema"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../schema/stock/stocks.schema"

const transferout = {
    Query: {
        getTransferOuts: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await TransferOutSchema.find().populate(["product_lists.products", "supplier_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferOut: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newtransferout = new TransferOutSchema({
                    ...args.input
                })

                const transferoutproduct_map: any = newtransferout.product_lists

                for (var i = 0; i < transferoutproduct_map.length; i++) {
                    const product_id = transferoutproduct_map[i].products
                    const getStock = await StockSchema.findOne({ product_lists: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newtransferout.save()

                    const stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand - transferoutproduct_map[i].qty } }

                    await StockSchema.findOneAndUpdate({ product_lists: product_id }, stockDoc, { new: true })
                }

                if (!newtransferout) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default transferout