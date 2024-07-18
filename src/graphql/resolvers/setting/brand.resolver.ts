import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import BrandSchema from "../../../schema/setting/brand.schema"
import { message, messageError } from "../../../helper/message.helper"

const brand = {
    Query: {
        getBrands: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args

                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { brand_name: { $regex: keyword, $options: "i" } } : {}
                    ]
                }

                return await BrandSchema.paginate(query, options);
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createBrand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newbrand = new BrandSchema({
                    ...args.input
                })

                await newbrand.save()

                if (!newbrand) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateBrand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const brandDoc = { $set: { ...args.input } }

                const updateDoc = await BrandSchema.findByIdAndUpdate(id, brandDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteBrand: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteBrand = await BrandSchema.findByIdAndDelete(id)

                if(!deleteBrand){
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default brand