import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import StockSchema from "../../../schema/stock/stocks.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const stock = {
    Query: {
        getStocks: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: "product_details",
                    page: page,
                    limit: limit
                }
                return await StockSchema.paginate({}, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        updateStock: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
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