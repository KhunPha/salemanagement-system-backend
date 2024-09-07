import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import TransferInSchema from "../../../model/stock/transfer_in.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const transferin = {
    Query: {
        getTransferIns: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                return await TransferInSchema.find().populate(["product_lists.products", "supplier_details", "createdBy", "modifiedBy"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferIn: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const newtransferin = new TransferInSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const transferinproduct_map: any = newtransferin.product_lists

                for (var i = 0; i < transferinproduct_map.length; i++) {
                    const product_id = transferinproduct_map[i].product_details
                    const getStock = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newtransferin.save()

                    const stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand + transferinproduct_map[i].qty } }

                    await StockSchema.findOneAndUpdate({ product_details: product_id }, stockDoc, { new: true, runValidators: true })
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