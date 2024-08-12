import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import UnitSchema from "../../../schema/setting/unit.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import { PubSub } from "graphql-subscriptions"

const pubsub = new PubSub()

const unit = {
    Query: {
        getUnits: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { unit_name: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }

                return await UnitSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newunit = new UnitSchema({
                    ...args.input
                })

                await newunit.save()

                if (!newunit) {
                    return messageError
                }

                pubsub.publish("UNIT_ADDED", { unitAdded: newunit })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const unitDoc = { $set: { ...args.input } }

                const updateDoc = await UnitSchema.findByIdAndUpdate(id, unitDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteUnit = await UnitSchema.findByIdAndDelete(id)

                if (!deleteUnit) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Subscription: {
        unitAdded: {
            subscribe: () => pubsub.asyncIterator("UNIT_ADDED")
        }
    }
}

export default unit
