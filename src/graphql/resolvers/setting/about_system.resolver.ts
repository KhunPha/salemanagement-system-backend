import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import AboutSystemSchema from "../../../model/setting/about_system.model"
import cloudinary from "../../../util/cloudinary"
import { message } from "telegram/client"

const aboutsystem = {
    Query: {
        getAboutSystem: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { section } = args

                return await AboutSystemSchema.find({ section: section })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        uploadVideoAboutSystem: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                if (args.file) {
                    const { createReadStream } = await args.file
                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'video', format: 'MP4' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    })

                    console.log("Upload:", result.public_id)

                    return { url: result?.url, publicId: result?.public_id, status: true }
                }

                return { url: "", publicId: "", status: true }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteVideoAboutSystem: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                if (args) {
                    await cloudinary.uploader.destroy(args.publicId, { resource_type: 'video' })
                    return true
                }

                return false
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        createAboutSystem: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const newaboutsystem = new AboutSystemSchema({
                    ...args.input
                })

                await newaboutsystem.save()

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteAboutSystem: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = args

                const deleteAboutSystem: any = await AboutSystemSchema.findByIdAndDelete(id)

                if (deleteAboutSystem.publicId)
                    try {
                        new Promise(async () => {
                            await cloudinary.uploader.destroy(deleteAboutSystem.publicId, { resource_type: "video" })
                        })
                    } catch (err: any) {
                        throw new ApolloError(err.message)
                    }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default aboutsystem