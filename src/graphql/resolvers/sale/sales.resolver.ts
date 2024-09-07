import { ApolloError } from "apollo-server-express"
import SaleSchema from "../../../model/sale/sales.model"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import ProductAddSchema from "../../../model/sale/product_add.model"
import UPDiscountSchema from "../../../model/sale/unit_product_discount.model"

const sales = {
    Query: {
        getSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: [
                        {
                            path: 'product_lists.product',
                            populate: {
                                path: 'category unit color brand'
                            }
                        }
                    ],
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                return await SaleSchema.paginate({}, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSales: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const newsales = new SaleSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                args.input.product_add.sale_id = newsales._id

                const newprodcutadd = new ProductAddSchema({
                    ...args.input.product_add
                })

                args.input.unit_product_discount.sale_id = newsales._id

                const newunitproductadd = new UPDiscountSchema({
                    ...args.input.unit_product_discount
                })

                await newsales.save()
                await newprodcutadd.save()
                await newunitproductadd.save()

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