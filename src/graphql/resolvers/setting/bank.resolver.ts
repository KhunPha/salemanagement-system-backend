import { ApolloError } from "apollo-server-express";
import BankSchema from "../../../schema/setting/bank.schema";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { customLabels } from "../../../helper/customeLabels.helper";
import { PaginateOptions } from "mongoose";

const bank = {
    Query: {
        getBankPagination: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { bank_name: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }
                return await BankSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newbank = new BankSchema({
                    ...args.input
                })

                await newbank.save()

                if (!newbank) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { bank_name, remark } = args.input
                const { id } = args

                const bankDoc = { $set: { bank_name: bank_name, remark: remark } }

                const updateDoc = await BankSchema.findByIdAndUpdate(id, bankDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args
                const deleteBank = await BankSchema.findByIdAndDelete(id)

                if (!deleteBank) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default bank