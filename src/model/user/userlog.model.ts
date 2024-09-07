import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUserLog extends Document {
    user_details: object,
    user_ip_address: string,
    token: string
    terminate: boolean
}

const userlog = new Schema<IUserLog>({
    user_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    user_ip_address: {
        type: String
    },
    token: {
        type: String
    },
    terminate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

userlog.plugin(paginate)

const UserLogSchema = mongoose.model<IUserLog, PaginateModel<IUserLog>>("UserLog", userlog, "UserLogs")

export default UserLogSchema