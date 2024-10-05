import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ShiftSchema from "../../../model/sale/shift.model"
import { message } from "../../../helper/message.helper"

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
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
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
                const today = new Date(), startOfDay = new Date(), endOfDay = new Date()
                const curHr = today.getHours()

                if (curHr < 12) {
                    startOfDay.setHours(0, 0, 0, 0); // Set to midnight

                    endOfDay.setHours(11, 59, 59, 999); // Set to the end of the day
                } else {
                    startOfDay.setHours(12, 0, 0, 0); // Set to midnight

                    endOfDay.setHours(23, 59, 59, 999);
                }

                const shiftData: any = await ShiftSchema.findOne({
                    createdAt: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                })

                await ShiftSchema.findByIdAndUpdate(shiftData?._id, { $set: { isOpen: false } })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shift