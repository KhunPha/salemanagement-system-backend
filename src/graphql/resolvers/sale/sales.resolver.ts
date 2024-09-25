import { ApolloError } from "apollo-server-express"
import SaleSchema from "../../../model/sale/sales.model"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import SalePaymentSchema from "../../../model/sale/salesPayment.model"
import Sequence from "../../../model/sale/sequent.model"
import StockSchema from "../../../model/stock/stocks.model"

const sales = {
    Query: {
        getSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword, customer, pay_status } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: 'product_lists.product',
                            populate: {
                                path: 'category unit color brand'
                            }
                        },
                        {
                            path: 'customer',
                        }
                    ],
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                let pay_stat: any = {};

                if (pay_status === "UnPaid") {
                    pay_stat = {
                        due: { $gt: 0 }
                    }
                } else if (pay_status === "Paid") {
                    pay_stat = {
                        due: { $eq: 0 }
                    }
                } else {
                    pay_stat = {
                        due: { $gte: 0 }
                    }
                }

                const query = {
                    $and: [
                        keyword ? { invoice_number: { $regex: keyword, $options: "i" } } : {},
                        customer ? { customer } : {},
                        { due: pay_stat.due }
                    ],
                    isSuspend: { $ne: true }
                }

                return await SaleSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getSalePayment: async (parent: any, args: any, context: any) => {
            try {
                const { sale_id } = args;

                return await SalePaymentSchema.find({ sale_id });
            } catch (error: any) {
                throw new ApolloError(error)
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
                        },
                        {
                            path: 'customer'
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
                const findNum = await Sequence.findOne({})

                return `INV-${1000000 + Number(findNum?.value) + 1}`
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

                const { invoice_number } = args.input

                let due = Number(args.input.total_amount) - Number(args.input.pay.dollar);
                let total_pay = Number(args.input.pay.dollar);

                if (args.input.pay.reil > 0) {
                    due = args.input.total_amount - ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar);
                    total_pay = ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar);
                }

                const findSale = await SaleSchema.findOneAndDelete({ invoice_number });

                if (findSale) {
                    const newsales = new SaleSchema({
                        invoice_number: args.input.invoice_number,
                        ...args.input,
                        due,
                        total_pay,
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
                }

                if (args.input.isSuspend) {
                    const newsales = new SaleSchema({
                        ...args.input,
                        cashier: userToken.data.user.firstname + userToken.data.user.lastname,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    })

                    if (!newsales) {
                        return messageError
                    }

                    await newsales.save()

                    return message
                }

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
                    payment_method: args?.input?.paymethod,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                if (!newsales) {
                    return messageError
                }

                if (!args.input.isSuspend) {
                    args?.input?.product_lists?.map(async (product: any) => {
                        const findStock: any = await StockSchema.findOne({ product_details: product?.product })
                        await StockSchema.findByIdAndUpdate(findStock?._id, { $set: { stock_on_hand: findStock?.stock_on_hand - product.qty } })
                    })
                    await newsales.save()
                    await newpayment.save()
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        salePayment: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { sale_id, remind_status, date_remind } = args.input

                const findSale: any = await SaleSchema.findById(sale_id)

                let due = findSale?.total_amount - findSale?.total_pay + Number(args.input.pay.dollar);
                let total_pay = Number(args.input.pay.dollar);

                if (args.input.pay.reil > 0) {
                    due = findSale?.total_amount - findSale?.total_pay + ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar);
                    total_pay = findSale?.total_pay + ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar);
                }

                await SaleSchema.findByIdAndUpdate(sale_id, { $set: { remind_status, date_remind } })

                await new SalePaymentSchema({
                    ...args.input,
                    due,
                    total_pay,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                }).save()

                return message;
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        clearSaleSuspend: async (parent: any, args: any, context: any) => {
            try {
                const { id } = args

                await SaleSchema.findByIdAndDelete(id)

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default sales