import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";

const customer = {
    Query: {
        getCustomers: async () => await CustomerSchema.find()
    },
    Mutation: {
        createCustomer: async (parent: any, args: any) => {
            try {
                const newcustomer = new CustomerSchema({
                    ...args.data
                })

                await newcustomer.save()

                return newcustomer
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCustomer: async (parent: any, args: any) => {
            try {
                const {customer_name, phone_number, email, types, remark} = args.data
                const {id} = args.id

                const customerDoc = {$set: {customer_name, phone_number, email, types, remark}}

                const updateDoc = await CustomerSchema.findByIdAndUpdate(id, customerDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default customer