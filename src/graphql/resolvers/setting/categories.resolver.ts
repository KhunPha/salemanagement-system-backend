import { ApolloError } from "apollo-server-express";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import { verifyToken } from "../../../middleware/auth.middleware";
import verify from "../../../helper/verifyToken.helper";
import {message, messageLogin} from "../../../helper/message.helper"

const category = {
    Query: {
        getCategories: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await CategoriesSchema.find()
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createCategory: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newcate = new CategoriesSchema({
                    ...args.data
                })

                await newcate.save()

                if (!newcate) {
                    throw new ApolloError("Create failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCategory: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { category_name, remark } = args.data
                const { id } = args

                const cateDoc = { $set: { category_name, remark } }

                const updateDoc = await CategoriesSchema.findByIdAndUpdate(id, cateDoc)

                if (!updateDoc) {
                    throw new ApolloError("Update failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCategory: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteCategory = await CategoriesSchema.findOneAndDelete(id)

                if (!deleteCategory) {
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default category