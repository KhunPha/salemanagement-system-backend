import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import StockSchema from "../../../model/stock/stocks.model"

const getstocksale = {
    Query: {
        getStocksSale: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { page, limit, pagination, keyword, category } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: {
                        path: "product_details",
                        populate: {
                            path: "category brand color unit",
                        },
                        match: {
                            $and: [
                                {
                                    $or: [
                                        keyword ? { pro_name: { $regex: keyword, $options: "i" } } : {},
                                        keyword ? { barcode: { $regex: keyword, $options: "i" } } : {}
                                    ]
                                },
                                category ? { category } : {}
                            ]
                        }
                    },
                    page,
                    limit,
                    sort: { createdAt: -1 }
                }

                const StockSale: any = await StockSchema.paginate({}, options)
                const data = StockSale.data.filter((data: any) => data.product_details != null)
                const paginator = StockSale.paginator

                return { data, paginator }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default getstocksale