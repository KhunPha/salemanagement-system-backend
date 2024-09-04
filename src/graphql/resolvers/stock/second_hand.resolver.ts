import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import SecondHandSchema from "../../../model/stock/second_hand.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import ProductSchema from "../../../model/product/products.model"
import StockSchema from "../../../model/stock/stocks.model"

const secondhand = {
    Query: {
        getSecondHands: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
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
                        },
                        {
                            isDelete: { $ne: true }
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
                const userToken = verify(context.user)
                args.input.status = false

                const newsecondhand = new ProductSchema({
                    ...args.input,
                    createdBy: userToken._id,
                    modifiedBy: userToken._id
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
                const userToken = verify(context.user)
                const { id } = await args

                const SecondHandDoc = { $set: { ...args.input, modifiedBy: userToken._id } }

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
                const userToken = verify(context.user)
                const { id } = await args

                const updateDoc = { $set: { isDelete: true, modifiedBy: userToken._id } }

                const deleteSecondHand = await ProductSchema.findByIdAndUpdate(id, updateDoc)
                await StockSchema.findOneAndUpdate({ product_details: id }, { $set: { isDelete: true } })

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