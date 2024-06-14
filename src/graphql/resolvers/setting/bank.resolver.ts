import { ApolloError } from "apollo-server-express";
import BankSchema from "../../../schema/setting/bank.schema";
import { verifyToken } from "../../../middleware/auth.middleware";
import verify from "../../../function/verifyToken.function";

const bank = {
    Query: {
        getBanks: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return  await BankSchema.find()
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
    
                return newbank
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {bank_name, remark} = args.data
                const {id} = args.id
    
                const bankDoc = {$set: {bank_name: bank_name, remark: remark}}
    
                const updateDoc = await BankSchema.findByIdAndUpdate(id, bankDoc)
    
                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteBank: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {id} = args.id
                const deleteBank = await BankSchema.findByIdAndDelete(id)
    
                return deleteBank
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default bank