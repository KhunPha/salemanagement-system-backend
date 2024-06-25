import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";
import verify from "../../../helper/verifyToken.helper";
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const color = {
    Query: {
        getColors: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await ColorSchema.find()
            } catch (error: any) {

            }
        }
    },
    Mutation: {
        createColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newcolor = new ColorSchema({
                    ...args.data
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
                const { color_code, color_name, remark } = args.data
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