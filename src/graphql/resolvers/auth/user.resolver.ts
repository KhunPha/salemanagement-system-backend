import { ApolloError } from "apollo-server-express"
import UserShcema from "../../../schema/auth/user.schema"
import bcrypt from "bcrypt"
import { getToken } from "../../../helper"
import { verifyToken } from "../../../middleware/auth.middleware"
import { GraphQLUpload } from "graphql-upload-ts"
import path from "path"
import fs from "fs"
import verify from "../../../helper/verifyToken.helper"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import UserLogSchema from "../../../schema/auth/userlog.schema"
import { PubSub } from "graphql-subscriptions"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"

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
                var newfilename = "profile.png"

                const dupUser = await UserShcema.findOne({ username })

                if (dupUser) {
                    return messageError
                }

                const salt = await bcrypt.genSaltSync()
                const hashpassword = await bcrypt.hashSync(password, salt)

                if (args.file) {
                    const { createReadStream, filename, mimetype } = await args.file
                    let name = filename
                    const ext = name.split(".")[1]
                    name = `${Math.floor((Math.random() * 10000) + 1000)}`
                    newfilename = `${name}-${Date.now()}.${ext}`;
                    const localtion = path.join(__dirname, `../../../../public/images/${newfilename}`)
                    const stream = createReadStream()

                    await stream.pipe(fs.createWriteStream(localtion))
                }

                const newuser = new UserShcema({
                    firstname,
                    lastname,
                    username,
                    password: hashpassword,
                    roles,
                    image: `http://localhost:8080/public/images/${newfilename}`,
                    remark
                })

                await newuser.save()

                // WebScoket
                pubsub.publish("NEW_USER", { getnewUser: newuser })

                if (!newuser) {
                    return messageError
                }

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

                const passTrue = await bcrypt.compareSync(password, userfound.password)

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
                const userLog = verifyToken(context.user)

                if (id === userLog.input._id) {
                    throw new ApolloError("Cannot delete")
                }

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