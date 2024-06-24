import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import PurchaseSchema from "../../../schema/stock/purchases.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { format } from "date-fns"

const purchase = {
    Query: {
        getPurchases: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                return await PurchaseSchema.find().populate([
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
                            }
                        ]
                    }
                ])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createPurchase: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                var date = new Date(Date.now());
                date.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })
                const new_date = format(date, 'dd/MM/yyyy HH:mm:ii')

                const total_qty_map = await args.data.products_lists
                var total_qty = 0, total_price = [], total_amount = 0

                for (var i = 0; i < total_qty_map.length; i++) {
                    total_qty = total_qty + total_qty_map[i].qty
                    total_price[i] = total_qty_map[i].unit_price * total_qty_map[i].qty
                    total_amount = total_amount + total_price[i]
                }

                args.data.total_qty = total_qty
                args.data.amounts = total_amount
                args.data.date = new_date

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
        }
    }
}

export default purchase