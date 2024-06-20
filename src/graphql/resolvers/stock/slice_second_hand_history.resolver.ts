import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.function"
import SliceSecondHandHistorySchema from "../../../schema/stock/slice_second_hand_history.schema"

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
                    ...args.data
                })

                await newslicesecondhand.save()

                return newslicesecondhand.populate(["product_id", "grade_details"])
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default slicesecondhandhistory