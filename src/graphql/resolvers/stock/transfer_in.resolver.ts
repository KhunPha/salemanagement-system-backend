import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import TransferInSchema from "../../../model/stock/transfer_in.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const transferin = {
    Query: {
        getTransferIns: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { page, limit, pagination } = args

                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: "product_lists.product_details"
                        },
                        {
                            path: "supplier_details"
                        },
                        {
                            path: "createdBy"
                        },
                        {
                            path: "modifiedBy"
                        }
                    ],
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                return await TransferInSchema.paginate({}, options)
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

                let total_qty = 0;
                let total_price = 0;

                args.input.product_lists.map((product: any) => {
                    total_qty += product.qty;
                    total_price += product.qty * product.price
                })

                const newtransferin = new TransferInSchema({
                    ...args.input,
                    total_qty,
                    total_price,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const transferinproduct_map: any = newtransferin.product_lists

                if (!newtransferin?.product_lists || transferinproduct_map?.length <= 0) return messageError

                for (var i = 0; i < transferinproduct_map.length; i++) {
                    const product_id = transferinproduct_map[i].product_details
                    const getStock = await StockSchema.findOne({ product_details: product_id })

                    if (!getStock) {
                        return messageError
                    }

                    await newtransferin.save()

                    const stockQty = getStock?.stock_on_hand + transferinproduct_map[i].qty;

                    let isNotify = false;

                    if (stockQty >= 5) {
                        isNotify = true;
                    }

                    const stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand + transferinproduct_map[i].qty, isNotify, isNewInsert: false } }

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