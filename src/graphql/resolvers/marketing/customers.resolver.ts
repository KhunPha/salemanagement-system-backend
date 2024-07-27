import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";

const customer = {
    Query: {
        getCustomers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword, types } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        {
                            $or: [
                                keyword ? { customer_name: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { phone_number: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { email: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { address: { $regex: keyword, $options: 'i' } } : {},
                            ]
                        },
                        types ? { types } : {}
                    ]
                }

                return await CustomerSchema.paginate(query, options)
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
                const { id } = await args

                const customerDoc = { $set: { ...args.input } }

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