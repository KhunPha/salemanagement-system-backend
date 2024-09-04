import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import StockSchema from "../../../model/stock/stocks.model"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const stock = {
    Query: {
        getStocks: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: {
                        path: "product_details",
                        populate: {
                            path: "category brand color unit"
                        },
                        match: {
                            $or: [
                                { pro_name: { $regex: keyword, $options: "i" } },
                                { barcode: { $regex: keyword, $options: "i" } }
                            ]
                        }
                    },
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const stocks: any = await StockSchema.paginate({}, options)
                const data = stocks.data.filter((data: any) => data.product_details != null);
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
                const userToken = verify(context.user)
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