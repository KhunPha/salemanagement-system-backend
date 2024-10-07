import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ShiftSchema from "../../../model/sale/shift.model"
import { message } from "../../../helper/message.helper"
import SaleSchema from "../../../model/sale/sales.model"

const shift = {
    Query: {
        getShifts: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                return await ShiftSchema.findOne({ isOpen: true });
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        openShift: async (parent: any, args: any, context: any) => {
            try {
                const today = new Date()
                const curHr = today.getHours()
                args.input.shift = "Afternoon"

                if (curHr < 12) {
                    args.input.shift = "Morning"
                }

                const newshift = new ShiftSchema({
                    ...args.input
                })

                await newshift.save()

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        closeShift: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                await ShiftSchema.findByIdAndUpdate(id, { $set: { isOpen: false } });
                await SaleSchema.updateMany({ shift_id: id }, { shift_is_open: false })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shift