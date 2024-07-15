import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SecondHandSchema from "../../../schema/stock/second_hand.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const secondhand = {
    Query: {
        getSecondHands: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit
                }

                const query = {
                    $and: [
                        keyword ? { grade_name: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { barcode: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }
                return await SecondHandSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newsecondhand = new SecondHandSchema({
                    ...args.input
                })

                await newsecondhand.save()

                if (!newsecondhand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const SecondHandDoc = { $set: { ...args.input } }

                const updateDoc = await SecondHandSchema.findByIdAndUpdate(id, SecondHandDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteSecondHand = await SecondHandSchema.findByIdAndDelete(id)

                if (!deleteSecondHand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default secondhand