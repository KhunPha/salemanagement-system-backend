import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import ShopInformationSchema from "../../../schema/setting/shop_information.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"

const shop_information = {
    Query: {
        getShopInformation: async () => await ShopInformationSchema.findOne()
    },
    Mutation: {
        shopInformation: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const getInformation: any = await ShopInformationSchema.findOne();

                if (!getInformation._id) {
                    const insert = new ShopInformationSchema({
                        ...args
                    })

                    await insert.save()

                    return message
                }

                const shopDoc = { $set: { ...args.input } }

                await ShopInformationSchema.findByIdAndUpdate(getInformation._id, shopDoc, { new: true })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shop_information