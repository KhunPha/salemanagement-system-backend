import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import ExchangeRateSchema from "../../../schema/setting/exchange_rate.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

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
                    ...args.input
                })

                await newexchangerate.save()

                if (!newexchangerate) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { exchange_rate_name, exchange_rate, status, remark } = await args.input
                const { id } = await args

                const ExchangeRateDoc = { $set: { exchange_rate_name, exchange_rate, status, remark } }

                const updateDoc = await ExchangeRateSchema.findByIdAndUpdate(id, ExchangeRateDoc, { new: true })

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

export default exchange_rate