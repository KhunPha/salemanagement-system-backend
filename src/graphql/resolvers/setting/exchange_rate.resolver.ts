import { ApolloError } from "apollo-server-express"
import verify from "../../../function/verifyToken.function"
import ExchangeRateSchema from "../../../schema/setting/exchange_rate.schema"

const exchange_rate = {
    Query: {
        getExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await ExchangeRateSchema.findOne({ status: true })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newexchangerate = new ExchangeRateSchema({
                    ...args.data
                })

                await newexchangerate.save()

                return newexchangerate
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { exchange_rate_name, exchange_rate, status, remark } = await args.data
                const { id } = await args.id

                const ExchangeRateDoc = {$set: {exchange_rate_name, exchange_rate, status, remark}}

                const updateDoc = await ExchangeRateSchema.findByIdAndUpdate(id, ExchangeRateDoc, {new: true})

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default exchange_rate