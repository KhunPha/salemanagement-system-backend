import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import ShopInformationSchema from "../../../schema/setting/shop_information.schema"
import {message, messageError, messageLogin} from "../../../helper/message.helper"

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
                    ...args.input
                })

                await newshopinformation.save()

                if (!newshopinformation) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateShopInformation: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const ShopInformationDoc = { $set: { ...args.input } }

                const updateDoc = await ShopInformationSchema.findByIdAndUpdate(id, ShopInformationDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shop_information