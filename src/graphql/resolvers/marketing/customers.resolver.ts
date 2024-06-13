import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";
import { verifyToken } from "../../../middleware/auth.middleware";

const customer = {
    Query: {
        getCustomers: async (parent: any, args: any, context: any) => {
            if(!verifyToken(context.user)){
                throw new ApolloError("Unauthentication or Expired token")
            }
            return await CustomerSchema.find()
        }
    },
    Mutation: {
        createCustomer: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                const newcustomer = new CustomerSchema({
                    ...args.data
                })

                await newcustomer.save()

                return newcustomer
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCustomer: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                const { customer_name, phone_number, email, types, remark } = args.data
                const { id } = args.id

                const customerDoc = { $set: { customer_name, phone_number, email, types, remark } }

                const updateDoc = await CustomerSchema.findByIdAndUpdate(id, customerDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCustomer: async (parent: any, args: any, context: any) => {
            try {
                if(!verifyToken(context.user)){
                    throw new ApolloError("Unauthentication or Expired token")
                }
                const {id} = args.id

                const deleteCustomer = await CustomerSchema.findByIdAndDelete(id)

                return deleteCustomer
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default customer