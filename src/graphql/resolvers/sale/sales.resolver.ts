import { ApolloError } from "apollo-server-express"
import SaleSchema from "../../../model/sale/sales.model"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import SalePaymentSchema from "../../../model/sale/salesPayment.model"

const sales = {
    Query: {
        getSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: 'product_lists.product',
                            populate: {
                                path: 'category unit color brand'
                            }
                        }
                    ],
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                return await SaleSchema.paginate({ isSuspend: { $ne: true } }, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getSaleSuspend: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: 'product_lists.product',
                            populate: {
                                path: 'category unit color brand'
                            }
                        }
                    ],
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                return await SaleSchema.paginate({ isSuspend: { $ne: false } }, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getInvoiceNumber: async (parent: any, args: any, context: any) => {
            try {
                const findSaleInvoice = await SaleSchema.findOne({ createdAt: -1 })

                if (!findSaleInvoice)
                    return "INV-1000001"

                const invoice_number = findSaleInvoice?.invoice_number.split("-")[1]

                return `INV-${invoice_number + 1}`
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    },
    Mutation: {
        createSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const due = args.input.total_amount - ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar)

                const newsales = new SaleSchema({
                    ...args.input,
                    due,
                    cashier: userToken.data.user.firstname + userToken.data.user.lastname,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                const newpayment = new SalePaymentSchema({
                    sale_id: newsales?._id,
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                if (!newsales) {
                    return messageError
                }

                await newsales.save()
                await newpayment.save()

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default sales