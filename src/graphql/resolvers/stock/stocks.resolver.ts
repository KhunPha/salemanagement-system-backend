import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import StockSchema from "../../../model/stock/stocks.model"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

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
        updateStock: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { cost, discount } = await args.input
                const { id } = await args

                const StockDoc = { $set: { cost, discount } }

                const updateDoc = await StockSchema.findByIdAndUpdate(id, StockDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default stock