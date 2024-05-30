import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
    firstname: string,
    lastname: string,
    username: string,
    password: string
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
    }
}, {timestamps: true})

const UserShcema = mongoose.model<IUser>("User", user, "Users")
export default UserShcema