import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";
import { verifyToken } from "../../../middleware/auth.middleware";

const color = {
    Query: {
        getColors: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                return await ColorSchema.find()
            } catch (error: any) {
                
            }
        }
    },
    Mutation: {
        createColor: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
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
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
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
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
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