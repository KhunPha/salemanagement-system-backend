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
                const userToken: any = await verifyToken(context.user);
                if (!userToken.status) throw new ApolloError("Unauthorized");

                const { page, limit, pagination, type_of_product, category, keyword } = args;

                // Build the root query for stocks
                const stockQuery: any = {
                    isDividedProduct: { $ne: true }, // Exclude divided products
                    $and: [
                        { isDelete: { $ne: true } }, // Exclude deleted products
                        // Additional filters can be added here
                    ]
                };

                // If there are filters related to category or type_of_product
                if (category) {
                    stockQuery['product_details.category'] = category;
                }
                if (type_of_product && type_of_product !== "All") {
                    stockQuery['product_details.type_of_product'] = type_of_product;
                }

                // Perform the pagination query
                const stocks: any = await StockSchema.find(stockQuery).populate({
                    path: "product_details",
                    match: {
                        isDelete: { $ne: true }, // Exclude deleted product details
                        ...(keyword ? {
                            $or: [
                                { pro_name: { $regex: keyword, $options: "i" } },
                                { barcode: { $regex: keyword, $options: "i" } }
                            ]
                        } : {})
                    },
                    populate: [
                        {
                            path: "category",
                            match: { isDelete: { $ne: true } } // Exclude deleted categories
                        },
                        {
                            path: "unit",
                            match: { isDelete: { $ne: true } } // Exclude deleted units
                        },
                        {
                            path: "color",
                            match: { isDelete: { $ne: true } } // Exclude deleted colors
                        }
                    ],
                }).sort({ createdAt: -1 });

                // Filter out any stocks where product_details is null
                const filteredStocks = stocks.filter((stock: any) => stock.product_details !== null);

                // Paginate the filtered results
                const paginatedStocks = filteredStocks.slice((page - 1) * limit, page * limit);

                const paginator = {
                    slNo: (page - 1) * limit + 1,
                    prev: page > 1 ? page - 1 : null,
                    next: paginatedStocks.length < limit ? null : page + 1,
                    perPage: limit,
                    totalPosts: filteredStocks.length,
                    totalPages: Math.ceil(filteredStocks.length / limit),
                    currentPage: page,
                    hasPrevPage: page > 1,
                    hasNextPage: paginatedStocks.length === limit,
                    totalDocs: filteredStocks.length
                };

                return { data: paginatedStocks, paginator };
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getDiviceStock: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: {
                        path: "product_details",
                        populate: [
                            {
                                path: "category",
                                match: {
                                    isDelete: { $ne: true }
                                }
                            },
                            {
                                path: "unit",
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
                                { isDelete: { $ne: true } }
                            ],
                        }
                    },
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const stocks: any = await StockSchema.paginate({ isDividedProduct: { $ne: false } }, options)
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

                if (args.input.from_date === args.input.to_date || args.input.to_date < args.input.from_date) {
                    messageError.message_en = "The To date cannot be the same as or earlier than the From date."
                    messageError.message_kh = "ថ្ងៃផុតកំណត់មិនអាចជាដូចគ្នា ឬតូចជាងជាងថ្ងៃចាប់ផ្ដើមទេ។"

                    return messageError
                }

                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-CA');

                if (args.input.from_date <= formattedDate && args.input.to_date >= formattedDate) {
                    discountProduct = new DiscountProductSchema({
                        ...args.input,
                        isActive: true,
                        createdBy: userToken.data.user._id,
                        modifiedBy: userToken.data.user._id
                    })
                    args.input.product_id.map(async (product_id: any) => {
                        const findStock: any = await StockSchema.findOne({ product_details: product_id }).populate("product_details")

                        const findDiscount: any = await DiscountProductSchema.findById(findStock?.discount_id)

                        const pro_id = findDiscount?.product_id.filter((product_id: any) => product_id.toString() !== findStock?.product_details.toString())

                        if (pro_id?.length <= 0) {
                            await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { deadline: true, isActive: false, product_id: pro_id } })
                        } else if (findDiscount?.product_id?.length === 1) {
                            await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: pro_id, deadline: true, isActive: false } })
                        } else {
                            await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: pro_id } })
                        }

                        let after_discount: number = 0;
                        let discount_type = "%"
                        if (args.input.type === "Cash") {
                            discount_type = "$"
                            after_discount = findStock?.product_details?.price - args.input.discount;
                        } else {
                            const price_discount = findStock?.product_details?.price * (args.input.discount / 100)
                            after_discount = findStock?.product_details?.price - price_discount;
                        }

                        await StockSchema.findByIdAndUpdate(findStock._id, { $set: { discount_id: discountProduct._id, discount: args.input.discount, after_discount, discount_type, isDiscount: true, discount_day: args.input.to_date } })
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

                const findStock: any = await StockSchema.findById(id).populate("product_details")

                const findDiscount: any = await DiscountProductSchema.findById(findStock?.discount_id)

                const product_id = findDiscount?.product_id.filter((product_id: any) => product_id.toString() !== findStock?.product_details.toString())

                if (product_id?.length <= 0) {
                    await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { deadline: true, isActive: false, product_id: product_id } })
                } else {
                    await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: product_id } })
                }

                const updateDoc = { $set: { discount: 0, after_discount: findStock?.product_details?.price, discount_id: null, discount_type: "", isDiscount: false, discount_day: null } }

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
                    const findStock: any = await StockSchema.findById(id).populate("product_details")

                    const findDiscount: any = await DiscountProductSchema.findById(findStock?.discount_id)

                    const product_id = findDiscount?.product_id.filter((product_id: any) => product_id.toString() !== findStock?.product_details.toString())

                    if (product_id?.length <= 0) {
                        await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { deadline: true, isActive: false, product_id: product_id } })
                    } else {
                        await DiscountProductSchema.findByIdAndUpdate(findStock?.discount_id, { $set: { product_id: product_id } })
                    }

                    const updateDoc = { $set: { discount: 0, after_discount: findStock?.product_details?.price, discount_id: null, discount_type: "", isDiscount: false, discount_day: null } }

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