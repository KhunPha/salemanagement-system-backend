import { ApolloError } from "apollo-server-express"
import UserShcema from "../../../schema/auth/user.schema"
import bcrypt from "bcrypt"
import { getToken } from "../../../helper"
import { verifyToken } from "../../../middleware/auth.middleware"
import { GraphQLUpload } from "graphql-upload-ts"
import path from "path"
import fs from "fs"
import verify from "../../../helper/verifyToken.function"

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
            try {
                const { firstname, lastname, username, password, roles, image } = await args.data
                const { createReadStream, filename, mimetype } = await args.file

                const dupUser = await UserShcema.findOne({ username })

                if (dupUser) {
                    throw new ApolloError("Duplicate Username")
                }

                const salt = await bcrypt.genSaltSync()
                const hashpassword = await bcrypt.hashSync(password, salt)

                let name = filename
                const ext = name.split(".")[1]
                name = `${Math.floor((Math.random() * 10000) + 1000)}`
                const newfilename = `${name}-${Date.now()}.${ext}`;
                const localtion = path.join(__dirname, `../../../../public/images/${newfilename}`)
                const stream = createReadStream()

                await stream.pipe(fs.createWriteStream(localtion))

                const newuser = new UserShcema({
                    firstname,
                    lastname,
                    username,
                    password: hashpassword,
                    roles,
                    image: `http://localhost:8080/public/images/${newfilename}`
                })

                await newuser.save()

                return newuser
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        login: async (parent: any, args: any) => {
            try {
                const { username, password } = await args.data

                const userfound = await UserShcema.findOne({ username })

                if (!userfound) {
                    throw new ApolloError("User not found!")
                }

                const passTrue = await bcrypt.compareSync(password, userfound.password)

                if (!passTrue) {
                    throw new ApolloError("Incorrect password!")
                }

                userfound.token = await getToken(userfound)

                return userfound

            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUser: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { firstname, lastname, username, password, roles, image } = await args.data
                const { id } = args

                const userDoc = { $set: { firstname, lastname, username, password, roles, image } }

                const updateDoc = await UserShcema.findByIdAndUpdate(id, userDoc, { new: true })

                return updateDoc
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
                    throw new ApolloError("User not found")
                }

                return deleteUser
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default user