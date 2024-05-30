import UserShcema from "../../schema/user.schema"
import bcrypt from "bcrypt"

const user = {
    Query: {
        getUsers: async (parent: any, args: any) => {
            return await UserShcema.find()
        }
    },

    Mutation: {
        createUser: async (parent: any, args: any) => {
            const {firstname, lastname, username, password} = args.data

            const salt = await bcrypt.genSaltSync()
            const hashpassword = await bcrypt.hashSync(password, salt)

            const newuser = new UserShcema({
                firstname,
                lastname,
                username,
                password: hashpassword
            })

            await newuser.save()

            return newuser
        }
    }
}

export default user