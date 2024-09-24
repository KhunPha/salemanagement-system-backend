import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import TransferOutSchema from "../../../model/stock/transfer_out.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const transferout = {
    Query: {
        getTransferOuts: async (parent: any, args: any, context: any) => {
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

                return await TransferOutSchema.paginate({}, options)
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

                let total_qty = 0;
                let total_price = 0;

                args.input.product_lists.map((product: any) => {
                    total_qty += product.qty;
                    total_price += product.qty * product.price
                })

                const newtransferout = new TransferOutSchema({
                    ...args.input,
                    total_qty,
                    total_price,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const transferinproduct_map: any = newtransferout.product_lists

                if (!newtransferout?.product_lists || transferinproduct_map?.length <= 0) return messageError

                for (var i = 0; i < transferinproduct_map.length; i++) {
                    const product_id = transferinproduct_map[i].product_details
                    const getStock: any = await StockSchema.findOne({ product_details: product_id }).populate("product_details")

                    if (!getStock || getStock.stock_on_hand <= 0 || getStock?.stock_on_hand < transferinproduct_map[i].qty) {
                        messageError.message_kh = `${getStock?.product_details?.pro_name} ទំនិញមិនគ្រប់គ្រាន់`;
                        messageError.message_en = `${getStock?.product_details?.pro_name} stock not enough`;

                        return messageError
                    }

                    await newtransferout.save()

                    const stockDoc = { $set: { stock_on_hand: getStock.stock_on_hand - transferinproduct_map[i].qty } }

                    await StockSchema.findOneAndUpdate({ product_details: product_id }, stockDoc, { new: true, runValidators: true })
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