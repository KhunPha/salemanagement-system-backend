import { ApolloError } from "apollo-server-express";
import BankSchema from "../../../schema/setting/bank.schema";
import { verifyToken } from "../../../middleware/auth.middleware";
import verify from "../../../helper/verifyToken.helper";
import {message, messageLogin} from "../../../helper/message.helper"

const bank = {
    Query: {
        getBanks: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await BankSchema.find()
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
                    ...args.data
                })

                await newbank.save()

                if (!newbank) {
                    throw new ApolloError("Create failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { bank_name, remark } = args.data
                const { id } = args

                const bankDoc = { $set: { bank_name: bank_name, remark: remark } }

                const updateDoc = await BankSchema.findByIdAndUpdate(id, bankDoc)

                if (!updateDoc) {
                    throw new ApolloError("Update failed")
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
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default bank