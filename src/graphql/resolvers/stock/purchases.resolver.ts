import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import PurchaseSchema from "../../../model/stock/purchases.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const purchase = {
    Query: {
        getPurchases: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: "supplier_details",
                            model: "Supplier"
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
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { "supplier_details.supplier_name": { $regex: keyword, $options: "i" } } : {}
                    ]
                }

                return await PurchaseSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createPurchase: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

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
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
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
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = await args

                const voidpurchaseDoc = { $set: { isVoid: true, modifiedBy: userToken.data._id } }

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