import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";
import verify from "../../../helper/verifyToken.helper";
import {message, messageLogin} from "../../../helper/message.helper"

const customer = {
    Query: {
        getCustomers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await CustomerSchema.find()
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newcustomer = new CustomerSchema({
                    ...args.data
                })

                await newcustomer.save()

                if (!newcustomer) {
                    throw new ApolloError("Create failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { customer_name, phone_number, email, types, remark } = args.data
                const { id } = await args

                const customerDoc = { $set: { customer_name, phone_number, email, types, remark } }

                const updateDoc = await CustomerSchema.findByIdAndUpdate(id, customerDoc)

                if (!updateDoc) {
                    throw new ApolloError("Update failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteCustomer = await CustomerSchema.findByIdAndDelete(id)

                if (!deleteCustomer) {
                    throw new ApolloError("Delete failed")
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default customer