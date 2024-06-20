import { ApolloError } from "apollo-server-express"
import verify from "../../../function/verifyToken.function"
import StockSchema from "../../../schema/stock/stocks.schema"

const stock = {
    Query: {
        getStocks: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await StockSchema.find().populate("product_details")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        updateStock: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { cost, discount } = await args.data
                const { id } = await args.id

                const StockDoc = { $set: { cost, discount } }

                const updateDoc = await StockSchema.findByIdAndUpdate(id, StockDoc, {new: true})

                return updateDoc?.populate("product_details")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default stock