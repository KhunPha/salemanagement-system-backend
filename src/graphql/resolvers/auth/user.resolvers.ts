import { ApolloError } from "apollo-server-express"
import UserShcema from "../../../schema/auth/user.schema"
import bcrypt from "bcrypt"
import { getToken } from "../../../function"

const user = {
    Query: {
        getUsers: async (parent: any, args: any) => {
            const users = await UserShcema.find()
            return users
        },
        getUsersSearch: async (parent: any, args: any) => {
            const { search } = args.search
            const users = await UserShcema.find({
                $or: [
                    { firstname: { $regex: search, $options: "i" } },
                    { lastname: { $regex: search, $options: "i" } },
                    { username: { $regex: search, $options: "i" } }
                ]
            })
            return users
        }
    },

    Mutation: {
        createUser: async (parent: any, args: any) => {
            const { firstname, lastname, username, password, roles, image } = args.data

            const salt = await bcrypt.genSaltSync()
            const hashpassword = await bcrypt.hashSync(password, salt)

            const newuser = new UserShcema({
                firstname,
                lastname,
                username,
                password: hashpassword,
                roles,
                image
            })

            await newuser.save()

            return newuser
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
                return error.message
            }
        }
    }
}

export default user