import { ApolloError } from "apollo-server-express";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import { verifyToken } from "../../../middleware/auth.middleware";

const category = {
    Query: {
        getCategories: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                return await CategoriesSchema.find()
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        } 
    },
    Mutation: {
        createCategory: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                const newcate = new CategoriesSchema({
                    ...args.data
                })

                await newcate.save()

                return newcate
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCategory: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                const {category_name, remark} = args.data
                const {id} = args.id

                

                const cateDoc = {$set: {category_name, remark}}

                const updateDoc = await CategoriesSchema.findByIdAndUpdate(id, cateDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCategory: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
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