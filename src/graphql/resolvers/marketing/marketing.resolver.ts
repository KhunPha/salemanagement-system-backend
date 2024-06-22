import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import MarketingSchema from "../../../schema/marketing/marketing.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const marketing = {
    Query: {
        getMarketings: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await MarketingSchema.find().populate("customer")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createMarketing: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newmarketing = new MarketingSchema({
                    ...args.data
                })

                await newmarketing.save()

                if (!newmarketing) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateMarketing: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { title, description, customer, image } = await args.data
                const { id } = await args.id

                const MarketingDoc = { $set: { title, description, customer, image } }

                const updateDoc = await MarketingSchema.findByIdAndUpdate(id, MarketingDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteMarketing: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteMarketing = await MarketingSchema.findByIdAndDelete(id)

                if (!deleteMarketing) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default marketing