import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ShopInformationSchema from "../../../model/setting/shop_information.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import cloudinary from "../../../util/cloudinary"

const shop_information = {
    Query: {
        getShopInformation: async () => await ShopInformationSchema.findOne()
    },
    Mutation: {
        shopInformation: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const getInformation: any = await ShopInformationSchema.findOne();

                if (args.file) {
                    const { createReadStream } = await args.file

                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image', format: 'avif' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    });

                    if (!getInformation?._id) {

                        const insert = new ShopInformationSchema({
                            logo: result?.url,
                            ...args
                        })

                        await insert.save()

                        return message
                    }

                    const shopDoc = { $set: { ...args.input, logo: result?.url } }

                    await ShopInformationSchema.findByIdAndUpdate(getInformation._id, shopDoc, { new: true })

                    return message
                } else {
                    if (!getInformation?._id) {

                        const insert = new ShopInformationSchema({
                            logo: null,
                            ...args
                        })

                        await insert.save()

                        return message
                    }

                    const shopDoc = { $set: { ...args.input, logo: null } }

                    await ShopInformationSchema.findByIdAndUpdate(getInformation._id, shopDoc, { new: true })

                    return message
                }

            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default shop_information