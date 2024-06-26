import { ApolloError } from "apollo-server-express"
import ProductSchema from "../../../schema/product/products.schema"
import verify from "../../../helper/verifyToken.helper"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const product = {
    Query: {
        getProducts: async (parent: any, args: any, context: any) => {
            try {
                // Verify Toekn
                verify(context.user)

                var { page, limit, keyword, filter } = args

                if (!keyword) {
                    keyword = ""
                }

                const TProducts = await ProductSchema.find()

                const totalPages = Math.floor(TProducts.length / limit)

                const skip = (page - 1) * limit

                const products = await ProductSchema.find({
                    $or: [
                        { pro_name: { $regex: keyword, $options: "i" } },
                        { type_of_product: { $regex: keyword, $options: "i" } }
                    ]
                }).populate([
                    {
                        path: "category",
                    },
                    {
                        path: "unit"
                    },
                    {
                        path: "color"
                    }
                    ]).skip(skip).limit(limit)

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

                const newproduct = new ProductSchema({
                    ...args.data
                })

                await newproduct.save()

                if (!newproduct) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { pro_name, brand, size, color, type_of_product, category, unit, barcode, image, price } = args.data
                const { id } = args

                const productDoc = { $set: { pro_name, brand, size, color, type_of_product, category, unit, barcode, image, price } }

                const updateDoc = await ProductSchema.findByIdAndUpdate(id, productDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteProduct: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteProduct = await ProductSchema.findByIdAndDelete(id)

                if (!deleteProduct) {
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default product