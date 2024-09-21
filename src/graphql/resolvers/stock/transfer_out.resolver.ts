import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import TransferOutSchema from "../../../model/stock/transfer_out.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const transferout = {
    Query: {
        getTransferOuts: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                return await TransferOutSchema.find().populate(["product_lists.product_details", "supplier_details", "createdBy", "modifiedBy"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferOut: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const newtransferout = new TransferOutSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const transferoutproduct_map: any = newtransferout.product_lists

                for (var i = 0; i < transferoutproduct_map.length; i++) {
                    const product_id = transferoutproduct_map[i].product_details
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