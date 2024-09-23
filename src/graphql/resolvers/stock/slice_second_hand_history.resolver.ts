import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import SliceSecondHandHistorySchema from "../../../model/stock/slice_second_hand_history.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const slicesecondhandhistory = {
    Query: {
        getDividedProductHistory: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { divided_id } = args

                return await SliceSecondHandHistorySchema.find({ divided_id }).populate("grade_lists.grade_details")
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        DividedProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                    const { divided_id } = args

                const newslicesecondhand = new SliceSecondHandHistorySchema({
                    divided_id,
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                await newslicesecondhand.save()

                if (!newslicesecondhand) {
                    return messageError
                }

                args.input.grade_lists.map(async (grade_detail: any) => {
                    const getStock = await StockSchema.findOne({ product_details: grade_detail?.grade_details })

                    const stockDoc = { $set: { stock_on_hand: getStock?.stock_on_hand + grade_detail.qty } }

                    await StockSchema.findOneAndUpdate({ product_details: grade_detail?.grade_details }, stockDoc, { new: true })
                })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default slicesecondhandhistory