import { ApolloError } from "apollo-server-express"
import SupplierSchema from "../../../schema/stock/suppliers.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const supplier = {
    Query: {
        getSuppliers: async () => await SupplierSchema.find()
    },
    Mutation: {
        createSupplier: async (parent: any, args: any) => {
            try {
                const newsupplier = new SupplierSchema({
                    ...args.data
                })

                await newsupplier.save()

                if(!newsupplier){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSupplier: async (parent: any, args: any) => {
            try {
                const {supplier_name, phone_number, email, address, remark} = args.data
                const {id} = args

                const supplierDoc = {$set: {supplier_name, phone_number, email, address, remark}}

                const updateDoc = await SupplierSchema.findByIdAndUpdate(id, supplierDoc)

                if(!updateDoc){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSupplier: async (parent: any, args: any) => {
            try {
                const {id} = args

                const deleteSupplier = await SupplierSchema.findByIdAndDelete(id)

                if(!deleteSupplier){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default supplier