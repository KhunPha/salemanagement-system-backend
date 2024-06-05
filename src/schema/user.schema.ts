import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    roles: object,
    image: string
}

const user = new Schema<IUser>({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: mongoose.Types.ObjectId,
        ref: "Role",
        required: true
    },
    image: {
        type: String,
        default: ""
    }
}, {timestamps: true})

const UserShcema = mongoose.model<IUser>("User", user, "Users")
export default UserShcema