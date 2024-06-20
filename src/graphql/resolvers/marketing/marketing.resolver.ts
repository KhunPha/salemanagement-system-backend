import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.function"
import MarketingSchema from "../../../schema/marketing/marketing.schema"
import message from "../../../helper/message.helper"

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

                if(!newmarketing){
                    throw new ApolloError("Create failed")
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

                if(!updateDoc){
                    throw new ApolloError("Update failed")
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

                if(!deleteMarketing){
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default marketing