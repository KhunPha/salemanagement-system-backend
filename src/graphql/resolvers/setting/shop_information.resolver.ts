import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.function"
import ShopInformationSchema from "../../../schema/setting/shop_information.schema"

const shop_information = {
    Query: {
        getShopInformation: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await ShopInformationSchema.findOne()
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createShopInformation: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newshopinformation = new ShopInformationSchema({
                    ...args.data
                })

                await newshopinformation.save()

                return newshopinformation
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateShopInformation: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { logo, store_name, phone_number, email_address, address, remark } = await args.data
                const { id } = await args.id

                const ShopInformationDoc = { $set: { logo, store_name, phone_number, email_address, address, remark } }

                const updateDoc = await ShopInformationSchema.findByIdAndUpdate(id, ShopInformationDoc, { new: true })

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shop_information