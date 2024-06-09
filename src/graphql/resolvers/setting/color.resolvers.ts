import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../schema/setting/color.schema";

const color = {
    Query: {
        getColors: async () => await ColorSchema.find()
    },
    Mutation: {
        createColor: async (parent: any, args: any) => {
            try {
                const newcolor = new ColorSchema({
                    ...args.data
                })
                
                await newcolor.save()

                return newcolor
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateColor: async (parent: any, args: any) => {
            try {
                const {color_code, color_name, remark} = args.data
                const {id} = args.id

                const colorDoc = {$set: {color_code, color_name, remark}}

                const updateDoc = await ColorSchema.findByIdAndUpdate(id, colorDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteColor: async (parent: any, args: any) => {
            try {
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