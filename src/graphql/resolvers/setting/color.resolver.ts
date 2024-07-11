import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";

const color = {
    Query: {
        getColors: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit
                }

                const query = {
                    $and: [
                        keyword ? { color_code: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { color_name: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }
                return await ColorSchema.paginate(query, options)
            } catch (error: any) {

            }
        }
    },
    Mutation: {
        createColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newcolor = new ColorSchema({
                    ...args.input
                })

                await newcolor.save()

                if (!newcolor) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { color_code, color_name, remark } = args.input
                const { id } = args

                const colorDoc = { $set: { color_code, color_name, remark } }

                const updateDoc = await ColorSchema.findByIdAndUpdate(id, colorDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteColor = await ColorSchema.findByIdAndDelete(id)

                if (!deleteColor) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default color