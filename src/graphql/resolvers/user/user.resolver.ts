import { ApolloError } from "apollo-server-express"
import UserShcema from "../../../model/user/user.model"
import bcrypt from "bcrypt"
import { getToken } from "../../../helper"
import { FileUpload, GraphQLUpload } from "graphql-upload-ts"
import fs from "fs"
import verify from "../../../helper/verifyToken.helper"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import UserLogSchema from "../../../model/user/userlog.model"
import { PubSub } from "graphql-subscriptions"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import sharp from "sharp"
import path from "path"
import { buffer } from "stream/consumers"
import cloudinary from "../../../util/cloudinary"

const pubsub = new PubSub()

const user = {
    Upload: GraphQLUpload,

    Query: {
        getUsers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword, roles } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: - 1 }
                }

                const query = {
                    $and: [
                        {
                            $or: [
                                keyword ? { firstname: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { lastname: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { username: { $regex: keyword, $options: 'i' } } : {}
                            ]
                        },
                        roles === 'All' ? {} : { roles }
                    ]
                }
                return await UserShcema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },

    Mutation: {
        createUser: async (parent: any, args: any) => {
            try {
                const { firstname, lastname, username, password, roles, remark } = await args.input
                const img = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769658/rv8ojwv6bmlkkvok2nih.png"

                const dupUser = await UserShcema.findOne({ username })

                if (dupUser) {
                    return messageError
                }

                const salt = await bcrypt.genSalt()
                const hashpassword = await bcrypt.hash(password, salt)

                if (args.file) {
                    const { createReadStream, filename, mimetype } = await args.file

                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image', format: 'webp' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    });

                    // const localtion = `./public/user/${newfilename}`
                    // const stream = createReadStream()

                    // await stream.pipe(fs.createWriteStream(localtion))

                    args.input.image = `${result.url}`
                } else {
                    args.input.image = img
                }

                const newuser = new UserShcema({
                    firstname,
                    lastname,
                    username,
                    password: hashpassword,
                    roles,
                    image: args.input.image,
                    remark
                })

                await newuser.save()

                if (!newuser) {
                    return messageError
                }

                // WebScoket
                pubsub.publish("NEW_USER", { getnewUser: newuser })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        login: async (parent: any, args: any, context: any) => {
            try {
                const { username, password } = await args.input

                const userfound = await UserShcema.findOne({ username })

                if (!userfound) {
                    throw new ApolloError("User not found!")
                }

                const passTrue = await bcrypt.compare(password, userfound.password)

                if (!passTrue) {
                    throw new ApolloError("Incorrect password!")
                }

                const user_ip_address: any = context.client

                const findlog = await UserLogSchema.findOne({
                    $and: [
                        { user_details: `${userfound._id}` },
                        { user_ip_address: `${user_ip_address}` }
                    ]
                })

                if (findlog) {
                    var log_count = findlog.log_count + 1
                    const updateDoc = { $set: { log_count } }
                    await UserLogSchema.findByIdAndUpdate(findlog._id, updateDoc, { new: true })
                } else {
                    const newlog = new UserLogSchema({
                        user_details: userfound._id,
                        user_ip_address: context.client,
                        log_count: 1
                    })
                    await newlog.save()
                }

                messageLogin.token = await getToken(userfound)

                return messageLogin
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUser: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { firstname, lastname, username, password, roles, image, remark } = await args.input
                const { id } = args

                const salt = await bcrypt.genSalt()
                const hashpassword = await bcrypt.hashSync(password, salt)

                const userDoc = { $set: { firstname, lastname, username, password: hashpassword, roles, image, remark } }

                const updateDoc = await UserShcema.findByIdAndUpdate(id, userDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUser: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                const { id } = await args

                const deleteUser = await UserShcema.findByIdAndDelete(id)

                if (!deleteUser) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Subscription: {
        getnewUser: {
            subscribe: () => pubsub.asyncIterator("NEW_USER")
        }
    }
}

export default user