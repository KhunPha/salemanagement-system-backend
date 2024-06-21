import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SecondHandSchema from "../../../schema/stock/second_hand.schema"
import {message, messageLogin} from "../../../helper/message.helper"

const secondhand = {
    Query: {
        getSecondHands: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await SecondHandSchema.find()
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
                    ...args.data
                })

                await newsecondhand.save()

                if (!newsecondhand) {
                    throw new ApolloError("Create failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { grade_name, price, barcode, remark } = await args.data
                const { id } = await args.id

                const SecondHandDoc = { $set: { grade_name, price, barcode, remark } }

                const updateDoc = await SecondHandSchema.findByIdAndUpdate(id, SecondHandDoc, { new: true })

                if (!updateDoc) {
                    throw new ApolloError("Update failed")
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
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default secondhand