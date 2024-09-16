import { ApolloError } from "apollo-server-express"
import UserShcema from "../../../model/user/user.model"
import bcrypt from "bcrypt"
import { getToken } from "../../../helper"
import { FileUpload, GraphQLUpload } from "graphql-upload-ts"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import UserLogSchema from "../../../model/user/userlog.model"
import { PubSub } from "graphql-subscriptions"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import cloudinary from "../../../util/cloudinary"
const { v4: uuidv4 } = require('uuid');

const pubsub = new PubSub()

const user = {
    Upload: GraphQLUpload,

    Query: {
        getUsers: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
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
                    ],
                    isDelete: { $ne: true }
                }
                return await UserShcema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        getUserLogin: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                return userToken.data.user
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },

    Mutation: {
        uploadUserImage: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const img = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769658/rv8ojwv6bmlkkvok2nih.png"

                if (args.file) {
                    const { createReadStream } = await args.file

                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image', format: 'avif' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    });

                    console.log("Upload:", result.public_id)

                    return { url: result?.url, publicId: result?.public_id, status: true }
                }

                return { url: img, publicId: null, status: true }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUserImage: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const findUser = await UserShcema.findOne({ publicId: args.publicId })

                if (!findUser) {
                    const result = await cloudinary.uploader.destroy(args.publicId).then(function (value) { return true }).catch(function (error) { return false });
                    console.log("Delete:", args.publicId)
                    return result;
                }

                return false;
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        createUser: async (parent: any, args: any) => {
            try {
                const { firstname, lastname, username, password, roles, publicId, image, remark } = await args.input

                if (!args.input.publicId)
                    args.input.image = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769658/rv8ojwv6bmlkkvok2nih.png"

                const dupUser = await UserShcema.findOne({ username })

                if (dupUser) {
                    messageError.message_kh = "ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ!"
                    messageError.message_en = "Username already exists!"
                    return messageError
                }

                const salt = await bcrypt.genSalt()
                const hashpassword = await bcrypt.hash(password, salt)

                const newuser = new UserShcema({
                    ...args.input,
                    password: hashpassword
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

                const userfound = await UserShcema.findOne({ username }).select("-sessionId")

                if (!userfound) {
                    throw new ApolloError("User not found!")
                }

                const passTrue = await bcrypt.compare(password, userfound.password)

                if (!passTrue) {
                    throw new ApolloError("Incorrect password!")
                }

                const newSessionId = uuidv4()
                messageLogin.sessionId = newSessionId;
                await UserShcema.updateOne({ _id: userfound._id }, { sessionId: newSessionId });

                messageLogin.token = await getToken(userfound, newSessionId)

                const user_ip_address: any = context.client

                await UserLogSchema.findOneAndUpdate({
                    $and: [
                        { user_details: userfound._id },
                        { terminate: false }
                    ]
                }, { $set: { terminate: true } })

                // const newlog = new UserLogSchema({
                //     user_details: userfound._id,
                //     user_ip_address: user_ip_address,
                //     token: messageLogin.token
                // })
                // await newlog.save()

                return messageLogin
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        logout: async (parent: any, args: any, context: any) => {
            try {
                const userToken = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                await UserShcema.findByIdAndUpdate(userToken.data._id, { $set: { sessionId: null } })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUser: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                if (!args.input.publicId) {
                    const findUser = await UserShcema.findById(id)
                    args.input.image = findUser?.image
                    args.input.publicId = findUser?.publicId
                }

                const userDoc = { $set: { ...args.input } }

                const updateDoc: any = await UserShcema.findByIdAndUpdate(id, userDoc)

                if (args.input.publicId) {
                    if (args.input.publicId != updateDoc?.publicId)
                        try {
                            if (updateDoc?.publicId) {
                                await cloudinary.uploader.destroy(updateDoc?.publicId);
                            }
                        } catch (err: any) {
                            throw new ApolloError(err.message)
                        }
                }

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        resetPassword: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id, newPassword } = args

                const salt = await bcrypt.genSalt()
                const hastPassword = await bcrypt.hash(newPassword, salt)

                const userDoc = { $set: { password: hastPassword } }

                const updateDoc = await UserShcema.findByIdAndUpdate(id, userDoc)

                if (!updateDoc)
                    return messageError

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUser: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { id } = await args

                const updateDoc = { $set: { isDelete: true } }

                const deleteUser: any = await UserShcema.findByIdAndUpdate(id, updateDoc)

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