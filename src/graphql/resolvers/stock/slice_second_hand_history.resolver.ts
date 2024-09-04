import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SliceSecondHandHistorySchema from "../../../model/stock/slice_second_hand_history.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const slicesecondhandhistory = {
    Query: {
        getSecondHandSliceHistories: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                return await SliceSecondHandHistorySchema.find().populate("grade_details")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        SliceSecondHand: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                for (var i = 0; i < args.input.length; i++) {

                    const newslicesecondhand = new SliceSecondHandHistorySchema({
                        ...args.input[i],
                        createdBy: userToken._id,
                        modifiedBy: userToken._id
                    })
                    await newslicesecondhand.save()

                    if (!newslicesecondhand) {
                        return messageError
                    }

                    const getStock = await StockSchema.findOne({ product_details: newslicesecondhand.grade_details })
                    const stockDoc = { $set: { stock_on_hand: getStock?.stock_on_hand + args.input[i].qty } }
                    await StockSchema.findOneAndUpdate({ product_details: newslicesecondhand.grade_details }, stockDoc, { new: true })
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default slicesecondhandhistory