import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUser extends Document {
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    roles: string,
    image: string,
    publicId: string
    remark: string
    sessionId: string
    expoPushToken: object
    isDelete: boolean
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
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: String,
        enum: ["SUPER ADMIN", "ADMIN", "SALER", "STOCK"]
    },
    image: {
        type: String,
        default: ""
    },
    publicId: {
        type: String
    },
    remark: {
        type: String
    },
    sessionId: {
        type: String
    },
    expoPushToken: [{
        type: String,
        default: []
    }],
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

user.plugin(paginate)

const UserSchema = mongoose.model<IUser, PaginateModel<IUser>>("User", user, "Users")
export default UserSchema