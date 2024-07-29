import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SecondHandSchema from "../../../schema/stock/second_hand.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import ProductSchema from "../../../schema/product/products.schema"
import StockSchema from "../../../schema/stock/stocks.schema"

const secondhand = {
    Query: {
        getSecondHands: async (parent: any, args: any, context: any) => {
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
                        {
                            $or: [
                                keyword ? { pro_name: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { barcode: { $regex: keyword, $options: 'i' } } : {}
                            ]
                        },
                        {
                            status: false
                        }
                    ]
                }
                return await ProductSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                args.input.status = false
                const newsecondhand = new ProductSchema({
                    ...args.input
                })

                await newsecondhand.save()

                await new StockSchema({
                    product_details: newsecondhand._id
                }).save()

                if (!newsecondhand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const SecondHandDoc = { $set: { ...args.input } }

                const updateDoc = await ProductSchema.findByIdAndUpdate(id, SecondHandDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSecondHand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteSecondHand = await ProductSchema.findByIdAndDelete(id)

                if (!deleteSecondHand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default secondhand