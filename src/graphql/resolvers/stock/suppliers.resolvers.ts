import { ApolloError } from "apollo-server-express"
import SupplierSchema from "../../../schema/stock/suppliers.schema"

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

                return newsupplier
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSupplier: async (parent: any, args: any) => {
            try {
                const {supplier_name, phone_number, email, address, remark} = args.data
                const {id} = args.id

                const supplierDoc = {$set: {supplier_name, phone_number, email, address, remark}}

                const updateDoc = await SupplierSchema.findByIdAndUpdate(id, supplierDoc)

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSupplier: async (parent: any, args: any) => {
            try {
                const {id} = args.id

                const deleteSupplier = await SupplierSchema.findByIdAndDelete(id)

                return deleteSupplier
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default supplier