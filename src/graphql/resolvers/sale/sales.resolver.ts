import { ApolloError } from "apollo-server-express"
import SaleSchema from "../../../model/sale/sales.model"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import SalePaymentSchema from "../../../model/sale/salesPayment.model"
import Sequence from "../../../model/sale/sequent.model"
import StockSchema from "../../../model/stock/stocks.model"
import ShiftSchema from "../../../model/sale/shift.model"

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
                        due: { $lte: 0 }
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

                return await SalePaymentSchema.find({ sale_id }).populate("bank").sort({ createdAt: -1 });
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
                const findNum: any = await Sequence.findOne({})

                return `INV-${1000000 + findNum?.value + 1}`
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    },
    Mutation: {
        createSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user);
                if (!userToken.status) throw new ApolloError("Unauthorization");

                const findShift = await ShiftSchema.findOne({ isOpen: true })

                if(!findShift){
                    messageError.message_en = "Please open shift";
                    messageError.message_kh = "សូមមេត្តាបើកវេនលក់ជាមុនសិន";

                    return messageError
                }

                const { invoice_number } = args.input;

                let payback = 0;

                if (args.input.payback.dollar > 0) {
                    payback = args?.input?.payback?.dollar;
                }

                let due = args.input.total_amount - args.input.pay.dollar + payback;
                let total_pay = args.input.pay.dollar - payback;

                // Paid
                let paid_dollar = args.input.pay.dollar;
                let paid_riel = 0;

                if (args?.input?.payback?.reil > 0) {
                    payback = ((args.input.payback.reil / args.input.exchange_rate) + args.input.payback.dollar)
                }

                if (args?.input?.pay?.reil > 0) {
                    due = args.input.total_amount - ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar) + payback;
                    total_pay = ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar) - payback;

                    paid_riel = args.input.pay.reil;
                }

                const findSale = await SaleSchema.findOneAndDelete({ invoice_number });

                // Sale After Suspend
                if (findSale) {
                    const newsales = new SaleSchema({
                        invoice_number: args.input.invoice_number,
                        ...args.input,
                        due,
                        total_pay,
                        paid_dollar,
                        paid_riel,
                        payback,
                        shift_id: findShift?._id,
                        shift: findShift?.shift,
                        cashier: userToken.data.user.firstname + " " + userToken.data.user.lastname,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    });

                    const newpayment = new SalePaymentSchema({
                        sale_id: newsales?._id,
                        ...args.input,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    });

                    if (!newsales) {
                        return messageError;
                    }

                    await newsales.save();
                    await newpayment.save();

                    return message;
                }

                if (args.input.isSuspend) {
                    const newsales = new SaleSchema({
                        ...args.input,
                        shift_id: findShift?._id,
                        shift: findShift?.shift,
                        cashier: userToken.data.user.firstname + " " + userToken.data.user.lastname,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    });

                    if (!newsales) {
                        return messageError;
                    }

                    await newsales.save();

                    return message;
                }

                const newsales = new SaleSchema({
                    ...args.input,
                    due,
                    total_pay,
                    paid_dollar,
                    paid_riel,
                    payback,
                    shift_id: findShift?._id,
                    shift: findShift?.shift,
                    cashier: userToken.data.user.firstname + " " + userToken.data.user.lastname,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                });

                const newpayment = new SalePaymentSchema({
                    sale_id: newsales?._id,
                    ...args.input,
                    payment_method: args?.input?.paymethod,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                });

                if (!args.input.isSuspend) {
                    for (const product of args?.input?.product_lists) {
                        const findStock: any = await StockSchema.findOne({ product_details: product?.product }).populate("product_details");

                        if (findStock?.stock_on_hand <= 0 || findStock?.stock_on_hand < product?.qty) {
                            messageError.message_kh = `${findStock?.product_details?.pro_name} ទំនិញមិនគ្រប់គ្រាន់`;
                            messageError.message_en = `${findStock?.product_details?.pro_name} stock not enough`;

                            return messageError;
                        }

                        await StockSchema.findByIdAndUpdate(findStock?._id, {
                            $set: { stock_on_hand: findStock?.stock_on_hand - product?.qty }
                        });
                    }

                    await newsales.save();
                    await newpayment.save();
                }

                if (!newsales) {
                    return messageError;
                }

                return message;
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        salePayment: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { sale_id, remind_status, date_remind } = args.input

                let isNotify = false;

                if (remind_status) {
                    isNotify = true;
                }

                const findSale: any = await SaleSchema.findById(sale_id)

                let payback = 0;

                if (args.input.payback.dollar > 0) {
                    payback = args.input.payback.dollar;
                }

                let due = findSale?.total_amount - (findSale?.total_pay + args.input.pay.dollar - payback);
                let total_pay = findSale?.total_pay + args.input.pay.dollar - payback;

                // Paid
                let paid_dollar = findSale?.paid_dollar + args.input.pay.dollar;
                let paid_riel = findSale.paid_riel;

                if (args?.input?.payback?.reil > 0) {
                    payback = ((args.input.payback.reil / args.input.exchange_rate) + args.input.payback.dollar)
                }

                if (args.input.pay.reil > 0) {
                    due = findSale?.total_amount - (findSale?.total_pay + ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar) - payback);
                    total_pay = findSale?.total_pay + ((args.input.pay.reil / args.input.exchange_rate) + args.input.pay.dollar) - payback;
                    paid_riel += args.input.pay.reil;
                }

                await SaleSchema.findByIdAndUpdate(sale_id, { $set: { remind_status, date_remind, isNotify, due, total_pay, payback: findSale?.payback ? findSale?.payback + payback : payback, paid_dollar, paid_riel } })

                await new SalePaymentSchema({
                    ...args.input,
                    due,
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
        },
        voidSalePayment: async (parent: any, args: any) => {
            try {
                const { payment_id } = args

                const findSalePayment: any = await SalePaymentSchema.findByIdAndUpdate(payment_id, { $set: { isVoid: true } });
                const findSale: any = await SaleSchema.findById(findSalePayment?.sale_id);

                let payback = 0;

                if (findSalePayment?.payback.dollar > 0) {
                    payback = findSale?.payback - findSalePayment?.payback?.dollar;
                }

                let due = findSale?.due + (findSale?.payback - findSalePayment?.pay?.dollar);
                let total_pay = findSale?.total_pay - (findSalePayment?.pay?.dollar - findSalePayment?.payback?.dollar);

                // Paid
                let paid_dollar = findSale?.paid_dollar - findSalePayment?.pay.dollar;
                let paid_riel = findSale?.paid_riel;

                if (findSalePayment?.payback?.reil > 0) {
                    payback = findSale?.payback - ((findSalePayment?.payback?.reil / findSale?.exchange_rate) + findSalePayment?.payback.dollar);
                }

                if (findSalePayment?.pay?.reil > 0) {
                    due = findSale?.due + ((findSalePayment?.pay?.reil / findSale?.exchange_rate) + findSalePayment?.pay?.dollar);
                    total_pay = findSale?.total_pay - ((findSalePayment?.pay?.reil / findSale?.exchange_rate) + findSalePayment?.pay?.dollar);
                    paid_riel -= findSalePayment?.pay?.reil;
                }

                const updateDoc = { $set: { due: due, total_pay: total_pay, paid_dollar, paid_riel, payback } };

                await SaleSchema.findByIdAndUpdate(findSale?._id, updateDoc);

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default sales