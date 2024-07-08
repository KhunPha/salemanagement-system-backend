import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SliceSecondHandHistorySchema from "../../../schema/stock/slice_second_hand_history.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const slicesecondhandhistory = {
    Query: {
        getSecondHandSliceHistories: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await SliceSecondHandHistorySchema.find().populate(["product_id", "grade_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        SliceSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newslicesecondhand = new SliceSecondHandHistorySchema({
                    ...args.input
                })

                await newslicesecondhand.save()

                if (!newslicesecondhand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default slicesecondhandhistory