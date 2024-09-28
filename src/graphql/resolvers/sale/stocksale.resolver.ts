import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import StockSchema from "../../../model/stock/stocks.model"

const getstocksale = {
    Query: {
        getStocksSale: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user);
                if (!userToken.status) throw new ApolloError("Unauthorized");

                const { page, limit, pagination, type_of_product, category, keyword } = args;

                // Build the root query for stocks
                const stockQuery: any = {
                    isDividedProduct: { $ne: true }, // Exclude divided products
                    $and: [
                        { isDelete: { $ne: true } }, // Exclude deleted products
                        // Additional filters can be added here
                    ]
                };

                // If there are filters related to category or type_of_product
                if (category) {
                    stockQuery['product_details.category'] = category;
                }
                if (type_of_product && type_of_product !== "All") {
                    stockQuery['product_details.type_of_product'] = type_of_product;
                }

                // Perform the pagination query
                const stocks: any = await StockSchema.find(stockQuery).populate({
                    path: "product_details",
                    match: {
                        isDelete: { $ne: true }, // Exclude deleted product details
                        ...(keyword ? {
                            $or: [
                                { pro_name: { $regex: keyword, $options: "i" } },
                                { barcode: { $regex: keyword, $options: "i" } }
                            ]
                        } : {})
                    },
                    populate: [
                        {
                            path: "category",
                            match: { isDelete: { $ne: true } } // Exclude deleted categories
                        },
                        {
                            path: "unit",
                            match: { isDelete: { $ne: true } } // Exclude deleted units
                        },
                        {
                            path: "color",
                            match: { isDelete: { $ne: true } } // Exclude deleted colors
                        }
                    ],
                }).sort({ createdAt: -1 });

                // Filter out any stocks where product_details is null
                const filteredStocks = stocks.filter((stock: any) => stock.product_details !== null);

                // Paginate the filtered results
                const paginatedStocks = filteredStocks.slice((page - 1) * limit, page * limit);

                const paginator = {
                    slNo: (page - 1) * limit + 1,
                    prev: page > 1 ? page - 1 : null,
                    next: paginatedStocks.length < limit ? null : page + 1,
                    perPage: limit,
                    totalPosts: filteredStocks.length,
                    totalPages: Math.ceil(filteredStocks.length / limit),
                    currentPage: page,
                    hasPrevPage: page > 1,
                    hasNextPage: paginatedStocks.length === limit,
                    totalDocs: filteredStocks.length
                };

                return { data: paginatedStocks, paginator };
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default getstocksale