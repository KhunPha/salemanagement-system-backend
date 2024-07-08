import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";
import verify from "../../../helper/verifyToken.helper";
import {message, messageError, messageLogin} from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";

const customer = {
    Query: {
        getCustomers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit
                }
                return await CustomerSchema.paginate({}, options)
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
                    ...args.input
                })

                await newcustomer.save()

                if (!newcustomer) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { customer_name, phone_number, email, types, remark } = args.input
                const { id } = await args

                const customerDoc = { $set: { customer_name, phone_number, email, types, remark } }

                const updateDoc = await CustomerSchema.findByIdAndUpdate(id, customerDoc)

                if (!updateDoc) {
                    return messageError
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
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default customer