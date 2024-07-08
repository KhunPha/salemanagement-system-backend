import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import UnitSchema from "../../../schema/setting/unit.shema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const unit = {
    Query: {
        getUnits: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit
                }
                return await UnitSchema.paginate({}, options)
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