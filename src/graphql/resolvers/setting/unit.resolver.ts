import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import UnitSchema from "../../../schema/setting/unit.shema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const unit = {
    Query: {
        getUnits: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                var { page, limit, keyword } = args

                if (!keyword) {
                    keyword = ""
                }

                const TUnits = await UnitSchema.find()

                const totalPages = Math.floor(TUnits.length / limit)

                const skip = (page - 1) * limit

                const units = await UnitSchema.find({
                    $or: [
                        { unit_name: { $regex: keyword, $options: "i" } },
                        { remark: { $regex: keyword, $options: "i" } }
                    ]
                }).skip(skip).limit(limit)

                return units
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newunit = new UnitSchema({
                    ...args.input
                })

                await newunit.save()

                if (!newunit) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { unit_name, remark } = await args.input
                const { id } = await args

                const unitDoc = { $set: { unit_name, remark } }

                const updateDoc = await UnitSchema.findByIdAndUpdate(id, unitDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteUnit = await UnitSchema.findByIdAndDelete(id)

                if (!deleteUnit) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default unit