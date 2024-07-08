import { ApolloError } from "apollo-server-express"
import SupplierSchema from "../../../schema/stock/suppliers.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import verify from "../../../helper/verifyToken.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

const supplier = {
    Query: {
        getSuppliers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit
                }
                return await SupplierSchema.paginate({}, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newsupplier = new SupplierSchema({
                    ...args.input
                })

                await newsupplier.save()

                if (!newsupplier) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { supplier_name, phone_number, email, address, remark } = args.input
                const { id } = args

                const supplierDoc = { $set: { supplier_name, phone_number, email, address, remark } }

                const updateDoc = await SupplierSchema.findByIdAndUpdate(id, supplierDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteSupplier = await SupplierSchema.findByIdAndDelete(id)

                if (!deleteSupplier) {
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