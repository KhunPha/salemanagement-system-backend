import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import PorductSchema from "../../../schema/product/products.schema"
import verify from "../../../function/verifyToken.function"

const product = {
    Query: {
        getProducts: async (parent: any, args: any, context: any) => {
            try {
                // Verify Toekn
                verify(context.user)

                var { page, limit, search } = args

                if (!search) {
                    search = ""
                }

                const TProducts = await PorductSchema.find()

                const totalPages = Math.floor(TProducts.length / limit)

                const skip = (page - 1) * limit

                const products = await PorductSchema.find({
                    $or: [
                        { pro_name: { $regex: search, $options: "i" } },
                        { type_of_product: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                        { unit: { $regex: search, $options: "i" } },
                        { price: { $regex: search, $options: "i" } }
                    ]
                }).skip(skip).limit(limit)

                return products
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                const newproduct = new PorductSchema({
                    ...args.data
                })

                await newproduct.save()

                return newproduct
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { pro_name, type_of_product, category, unit, barcode, image, price } = args.data
                const { id } = args

                const productDoc = {$set: {pro_name, type_of_product, category, unit, barcode, image, price}}

                const updateDoc = await PorductSchema.findByIdAndUpdate(id, productDoc, {new: true})

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {id} = args

                const deleteProduct = await PorductSchema.findByIdAndDelete(id)

                return deleteProduct
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default product