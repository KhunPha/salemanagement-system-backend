import { ApolloError } from "apollo-server-express"
import SaleSchema from "../../../schema/sale/sales.schema"
import verify from "../../../helper/verifyToken.helper"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

const sales = {
    Query: {
        getSales: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const sales = await SaleSchema.find().populate([{ path: 'product_lists.product', populate: { path: 'category unit' } }, { path: 'product_add.product_details', populate: { path: 'category unit' } }, { path: 'unit_product_discount.product_details', populate: { path: 'category unit' } }])
                return sales
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSales: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                console.log(args.data)
                const newsales = new SaleSchema({
                    ...args.data
                })

                await newsales.save()

                if (!newsales) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default sales