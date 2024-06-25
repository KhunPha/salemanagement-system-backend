import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import PurchaseSchema from "../../../schema/stock/purchases.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { date } from "../../../helper/date.helper"

const purchase = {
    Query: {
        getPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                var { search, page, limit, filter } = args
                let purchases = []

                if (!search) {
                    search = ""
                }

                if (!filter) {
                    filter = ""
                }

                const TPurchase = await PurchaseSchema.find()

                const totalPages = Math.floor(TPurchase.length / limit)

                const skip = (page - 1) * limit

                const purchase: any = await PurchaseSchema.find({status: true}).populate([
                    {
                        path: "supplier_details",
                        match: {
                            supplier_name: { $regex: filter, $options: "i" }
                        }
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
                            }
                        ]
                    }
                ]).skip(skip).limit(limit)

                for (let i in purchase) {
                    if (purchase[i].supplier_details) {
                        purchases.push(purchase[i])
                    }
                }

                return purchases
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                const total_qty_map = await args.data.products_lists
                var total_qty = 0, total_price = [], total_amount = 0

                for (var i = 0; i < total_qty_map.length; i++) {
                    total_qty = total_qty + total_qty_map[i].qty
                    total_price[i] = total_qty_map[i].unit_price * total_qty_map[i].qty
                    total_amount = total_amount + total_price[i]
                }

                args.data.total_qty = total_qty
                args.data.amounts = total_amount
                args.data.date = date()

                const newpurchase = new PurchaseSchema({
                    ...args.data
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
                const {id, status} = await args

                const voidpurchaseDoc = {$set: {status}}

                const voidDoc = await PurchaseSchema.findByIdAndUpdate(id, voidpurchaseDoc, {new: true})

                if(!voidDoc){
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