import { ApolloError } from "apollo-server-express";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";

const category = {
    Query: {
        getCategories: async (parent: any, args: any, context: any) => {
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
                        keyword ? { category_name: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }
                return await CategoriesSchema.paginate(query, options)
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
                    ...args.input
                })

                await newcate.save()

                if (!newcate) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCategory: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { category_name, remark } = args.input
                const { id } = args

                const cateDoc = { $set: { category_name, remark } }

                const updateDoc = await CategoriesSchema.findByIdAndUpdate(id, cateDoc)

                if (!updateDoc) {
                    return messageError
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
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default category