import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import StockSchema from "../../../model/stock/stocks.model"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import DiscountProductSchema from "../../../model/product/discount_products.model"

const stock = {
    Query: {
        getStocks: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, type_of_product, category, keyword } = args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: {
                        path: "product_details",
                        populate: [
                            {
                                path: "category",
                                match: {
                                    $and: {
                                        isDelete: { $ne: true }
                                    }
                                }
                            },
                            {
                                path: "unit",
                                match: {
                                    isDelete: { $ne: true }
                                }
                            },
                            {
                                path: "color",
                                match: {
                                    isDelete: { $ne: true }
                                }
                            },
                        ],
                        match: {
                            $and: [
                                {
                                    $or: [
                                        keyword ? { pro_name: { $regex: keyword, $options: "i" } } : {},
                                        keyword ? { barcode: { $regex: keyword, $options: "i" } } : {}
                                    ]
                                },
                                category ? { category } : {},
                                type_of_product === "All" ? {} : { type_of_product },
                                { isDelete: { $ne: true } }
                            ]
                        }
                    },
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const stocks: any = await StockSchema.paginate({ isDelete: { $ne: true } }, options)
                const data = stocks.data.filter((data: any) => data.product_details !== null && data?.product_details?.category !== null);
                const paginator = stocks.paginator

                return { data, paginator }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        discountProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                let discountProduct = new DiscountProductSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                if(args.input.from_date === args.input.to_date || args.input.to_date > args.input.from_date){
                    messageError.message_en = "The To date cannot be the same as or earlier than the From date."
                    messageError.message_kh = "ថ្ងៃផុតកំណត់មិនអាចជាដូចគ្នា ឬតូចជាងជាងថ្ងៃចាប់ផ្ដើមទេ។"

                    return messageError
                }

                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-CA');

                const to_date: any = new Date(args.input.to_date);
                const endDate: any = new Date();
                const diffInTime = to_date - endDate; // difference in milliseconds
                const diffInDays = diffInTime / (1000 * 3600 * 24); // convert to days

                if (args.input.from_date <= formattedDate && args.input.to_date >= formattedDate) {
                    discountProduct = new DiscountProductSchema({
                        ...args.input,
                        isActive: true,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    })
                    args.input.product_id.map(async (product_id: any) => {
                        const findStock: any = await StockSchema.findOne({ product_details: product_id }).populate("product_details")

                        let after_discount: number = 0;
                        let discount_type = "%"
                        if (args.input.type === "Cash") {
                            discount_type = "$"
                            after_discount = findStock?.product_details?.price - args.input.discount;
                        } else {
                            const price_discount = findStock?.product_details?.price * (args.input.discount / 100)
                            after_discount = findStock?.product_details?.price - price_discount;
                        }

                        await StockSchema.findByIdAndUpdate(findStock._id, { $set: { discount_id: discountProduct._id, discount: args.input.discount, after_discount, discount_type, isDiscount: true, discount_day: Math.round(diffInDays) } })
                    })
                }

                await discountProduct.save()

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        clearDiscountOneProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user);
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { id } = args

                const findStock = await StockSchema.findById(id)

                const findDiscount: any = await DiscountProductSchema.findById(findStock?.discount_id)

                const product_id = findDiscount?.product_id.filter((product_id: any) => product_id.toString() !== findStock?.product_details.toString())

                if (product_id?.length <= 0) {
                    await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { deadline: true, isActive: false, product_id: product_id } })
                } else {
                    await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: product_id } })
                }

                const updateDoc = { $set: { discount: 0, after_discount: 0, discount_id: null, discount_type: "", isDiscount: false } }

                await StockSchema.findByIdAndUpdate(id, updateDoc)

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        clearDiscountAllProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user);
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { id } = args

                id.map(async (id: any) => {
                    const findStock = await StockSchema.findById(id)

                    const findDiscount: any = await DiscountProductSchema.findById(findStock?.discount_id)

                    const product_id = findDiscount?.product_id.filter((product_id: any) => product_id.toString() !== findStock?.product_details.toString())

                    if (product_id?.length <= 0) {
                        await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { deadline: true, isActive: false, product_id: product_id } })
                    } else {
                        await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: product_id } })
                    }

                    const updateDoc = { $set: { discount: 0, after_discount: 0, discount_id: null, discount_type: "", isDiscount: false } }

                    await StockSchema.findByIdAndUpdate(id, updateDoc)
                })

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default stock