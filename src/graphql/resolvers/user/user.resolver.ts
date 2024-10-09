import { ApolloError } from "apollo-server-express"
import UserSchema from "../../../model/user/user.model"
import bcrypt from "bcrypt"
import { getToken } from "../../../helper"
import { FileUpload, GraphQLUpload } from "graphql-upload-ts"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError, messageLogin, messageMobileLogin } from "../../../helper/message.helper"
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
                return await UserSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        getUserLogin: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                return userToken?.data?.user
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

                const findUser = await UserSchema.findOne({ publicId: args.publicId })

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

                const dupUser = await UserSchema.findOne({ username })

                if (dupUser) {
                    messageError.message_kh = "ឈ្មោះអ្នកប្រើប្រាស់នេះមានរួចហើយ!"
                    messageError.message_en = "Username already exists!"
                    return messageError
                }

                const salt = await bcrypt.genSalt()
                const hashpassword = await bcrypt.hash(password, salt)

                const newuser = new UserSchema({
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

                const userfound = await UserSchema.findOne({ username }).select("-sessionId")

                if (!userfound) {
                    throw new ApolloError("User not found!")
                }

                const passTrue = await bcrypt.compare(password, userfound.password)

                if (!passTrue) {
                    throw new ApolloError("Incorrect password!")
                }

                const newSessionId = uuidv4()
                messageLogin.sessionId = newSessionId;
                await UserSchema.updateOne({ _id: userfound._id }, { sessionId: newSessionId });

                messageLogin.token = await getToken(userfound, newSessionId)

                return messageLogin
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        loginForMobile: async (parent: any, args: any, context: any) => {
            try {
                const { username, password } = args.input

                const userfound: any = await UserSchema.findOne({ username, roles: "ADMIN" }).select("-sessionId")

                if (!userfound) {
                    messageError.message_en = "User not found or user does not have admin privileges!";
                    messageError.message_kh = "រកមិនឃើញអ្នកប្រើប្រាស់ ឬអ្នកប្រើប្រាស់មិនមានសិទ្ធិជា Admin"

                    return messageError;
                }

                const passTrue = await bcrypt.compare(password, userfound.password)

                if (!passTrue) {
                    throw new ApolloError("Incorrect password!")
                }

                messageMobileLogin.token = await getToken(userfound, null);

                // const newSessionId = uuidv4()
                // messageLogin.sessionId = newSessionId;
                // messageLogin.token = await getToken(userfound, newSessionId)

                messageMobileLogin.user_data = userfound;

                return messageMobileLogin;
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        logout: async (parent: any, args: any, context: any) => {
            try {
                const userToken = await verifyToken(context.user)

                const id = userToken?.data?.user?._id;

                await UserSchema.findByIdAndUpdate(id, { $set: { sessionId: null } })

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
                    const findUser = await UserSchema.findById(id)
                    args.input.image = findUser?.image
                    args.input.publicId = findUser?.publicId
                }

                const userDoc = { $set: { ...args.input } }

                const updateDoc: any = await UserSchema.findByIdAndUpdate(id, userDoc)

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

                const updateDoc = await UserSchema.findByIdAndUpdate(id, userDoc)

                if (!updateDoc)
                    return messageError

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        changeUserStatus: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const { id, status } = await args

                let updateDoc = { $set: { status: false } };

                if (status) {
                    updateDoc = { $set: { status: true } };
                }


                const deleteUser: any = await UserSchema.findByIdAndUpdate(id, updateDoc)

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