import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SecondHandSchema from "../../../schema/stock/second_hand.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

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
                const { grade_name, price, barcode, remark } = await args.input
                const { id } = await args

                const SecondHandDoc = { $set: { grade_name, price, barcode, remark } }

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