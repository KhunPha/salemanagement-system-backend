import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import PurchaseSchema from "../../../schema/stock/purchases.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { date } from "../../../helper/date.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const purchase = {
    Query: {
        getPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: "supplier_details"
                        },
                        {
                            path: "products_lists.product_details",
                            populate: [
                                {
                                    path: "color"
                                },
                                {
                                    path: "category"
                                },
                                {
                                    path: "unit"
                                },
                                {
                                    path: "brand"
                                }
                            ]
                        }
                    ],
                    page: page,
                    limit: limit
                }

                const query = {
                    $and: [

                    ]
                }
                return await PurchaseSchema.paginate({}, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                const total_qty_map = await args.input.products_lists
                var total_qty = 0, total_price = [], total_amount = 0

                for (var i = 0; i < total_qty_map.length; i++) {
                    total_qty = total_qty + total_qty_map[i].qty
                    total_price[i] = total_qty_map[i].unit_price * total_qty_map[i].qty
                    total_amount = total_amount + total_price[i]
                }

                args.input.total_qty = total_qty
                args.input.amounts = total_amount
                args.input.date = new Date(args.input.date)

                const newpurchase = new PurchaseSchema({
                    ...args.input
                })

                await newpurchase.save()

                if (!newpurchase) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        voidPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args


                const voidpurchaseDoc = { $set: { isVoid: true } }

                const voidDoc = await PurchaseSchema.findByIdAndUpdate(id, voidpurchaseDoc, { new: true })

                if (!voidDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default purchase