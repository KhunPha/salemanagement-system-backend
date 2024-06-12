import { ApolloError } from "apollo-server-express";
import CategoriesSchema from "../../../schema/setting/categories.schema";

const category = {
    Query: {
        getCategories: async () => await CategoriesSchema.find()
    },
    Mutation: {
        createCategory: async (parent: any, args: any) => {
            try {
                const newcate = new CategoriesSchema({
                    ...args.data
                })

                await newcate.save()

                return newcate
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCategory: async (parent: any, args: any) => {
            try {
                const {category_name, remark} = args.data
                const {id} = args.id

                

                const cateDoc = {$set: {category_name, remark}}

                const updateDoc = await CategoriesSchema.findByIdAndUpdate(id, cateDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCategory: async (parent: any, args: any) => {
            try {
                const {id} = args.id

                const deleteCategory = await CategoriesSchema.findOneAndDelete(id)

                return deleteCategory
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default category