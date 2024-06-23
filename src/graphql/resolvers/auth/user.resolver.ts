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
import { UserLoginRules, UserRegisterationRules } from "../../../validators/auth.validation"

const user = {
    Upload: GraphQLUpload,

    Query: {
        getUsers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                var { search, page, limit } = args

                if (!search) {
                    search = ""
                }

                const TUsers = await UserShcema.find()

                const totalPages = Math.floor(TUsers.length / limit)

                const skip = (page - 1) * limit

                const users = await UserShcema.find({
                    $or: [
                        { firstname: { $regex: search, $options: "i" } },
                        { lastname: { $regex: search, $options: "i" } },
                        { username: { $regex: search, $options: "i" } }
                    ]
                }).skip(skip).limit(limit)

                return users
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },

    Mutation: {
        createUser: async (parent: any, args: any) => {
            const { firstname, lastname, username, password, roles, image } = await args.data
            var newfilename = "profile.png"

            await UserRegisterationRules.validate({
                firstname,
                lastname,
                username,
                password
            }, {
                abortEarly: false
            })

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
                image: `http://localhost:8080/public/images/${newfilename}`
            })

            await newuser.save()

            if (!newuser) {
                return messageError
            }

            return message
        },
        login: async (parent: any, args: any, context: any) => {
            const { username, password } = await args.data

            await UserLoginRules.validate({
                username,
                password
            }, {
                abortEarly: false
            })

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
        },
        updateUser: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { firstname, lastname, username, password, roles, image } = await args.data
                const { id } = args

                const userDoc = { $set: { firstname, lastname, username, password, roles, image } }

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

                if (id === userLog.data._id) {
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
    }
}

export default user