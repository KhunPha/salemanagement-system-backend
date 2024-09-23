import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import SliceSecondHandHistorySchema from "../../../model/stock/slice_second_hand_history.model"
import { message, messageError } from "../../../helper/message.helper"
import StockSchema from "../../../model/stock/stocks.model"

const slicesecondhandhistory = {
    Query: {
        getDividedProductHistory: async (parent: any, args: any, context: any) => {
            try {
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
                const { divided_id, unit_divided } = args

                const findStock: any = await StockSchema.findById(divided_id)

                if(!findStock || findStock?.stock_on_hand <= 0 || findStock?.stock_on_hand < unit_divided){
                    messageError.message_kh = `${findStock?.product_details.pro_name} ចំនួនមិនគ្រប់គ្រាន់`;
                    messageError.message_en = `${findStock?.product_details.pro_name} qty not enought`;

                    return messageError;
                }

                await StockSchema.findByIdAndUpdate(divided_id, { $set: { stock_on_hand: findStock?.stock_on_hand - unit_divided}})

                let total_qty = 0, total_amount = 0;

                args.input.grade_lists.map(async (grade_detail: any) => {
                    const getStock = await StockSchema.findOne({ product_details: grade_detail?.grade_details })

                    total_qty += grade_detail?.qty;
                    total_amount += grade_detail?.price * grade_detail?.qty;

                    const stockDoc = { $set: { stock_on_hand: getStock?.stock_on_hand + grade_detail.qty } }

                    await StockSchema.findOneAndUpdate({ product_details: grade_detail?.grade_details }, stockDoc, { new: true })
                })

                const newslicesecondhand = new SliceSecondHandHistorySchema({
                    divided_id,
                    ...args.input,
                    total_qty,
                    total_amount,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
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