import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";
import { verifyToken } from "../../../middleware/auth.middleware";
import verify from "../../../helper/verifyToken.function";
import message from "../../../helper/message.helper";

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

                if(!newcolor){
                    throw new ApolloError("Create failed")
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
                const { id } = args.id

                const colorDoc = { $set: { color_code, color_name, remark } }

                const updateDoc = await ColorSchema.findByIdAndUpdate(id, colorDoc)

                if(!updateDoc){
                    throw new ApolloError("Update failed")
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

                if(!deleteColor){
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default color