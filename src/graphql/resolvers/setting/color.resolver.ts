import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";
import { verifyToken } from "../../../middleware/auth.middleware";
import verify from "../../../function/verifyToken.function";

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

                return newcolor
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {color_code, color_name, remark} = args.data
                const {id} = args.id

                const colorDoc = {$set: {color_code, color_name, remark}}

                const updateDoc = await ColorSchema.findByIdAndUpdate(id, colorDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteColor: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {id} = args.id

                const deleteColor = await ColorSchema.findByIdAndDelete(id)

                return deleteColor
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default color