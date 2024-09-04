import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import ExchangeRateSchema from "../../../model/setting/exchange_rate.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"

const exchange_rate = {
    Query: {
        getExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                return await ExchangeRateSchema.findOne({ isActive: true })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getAllExchangeRate: async () => await ExchangeRateSchema.find()
    },
    Mutation: {
        exchangeRate: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const getExchangeRate = await ExchangeRateSchema.findOne({ type: args.input.type });

                if (!getExchangeRate?._id) {

                    const newexchangerate = new ExchangeRateSchema({
                        ...args.input
                    })

                    await newexchangerate.save()

                    return message
                }

                const exchangeRateDoc = { $set: { ...args.input } }

                await ExchangeRateSchema.findByIdAndUpdate(getExchangeRate._id, exchangeRateDoc, { new: true })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        applyUse: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = await args

                const getExchangeRate_True = await ExchangeRateSchema.findOne({ _id: { $ne: id } })

                await ExchangeRateSchema.findByIdAndUpdate(id, { $set: { isActive: true } })

                await ExchangeRateSchema.findByIdAndUpdate(getExchangeRate_True?._id, { $set: { isActive: false } })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default exchange_rate