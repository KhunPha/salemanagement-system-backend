import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import TransferInSchema from "../../../model/stock/transfer_in.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const transferin = {
    Query: {
        getTransferIns: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                return await TransferInSchema.find().populate(["product_lists.products", "supplier_details", "createdBy", "modifiedBy"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        TransferIn: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)

                const newtransferin = new TransferInSchema({
                    ...args.input,
                    createdBy: userToken._id,
                    modifiedBy: userToken._id
                })

                const transferinproduct_map: any = newtransferin.product_lists

                for (var i = 0; i < transferinproduct_map.length; i++) {
                    const product_id = transferinproduct_map[i].products
                    const getStock = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newtransferin.save()

                    const stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand + transferinproduct_map[i].qty } }

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