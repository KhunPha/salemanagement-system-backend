import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUserLog extends Document {
    user_details: object,
    user_ip_address: string,
    log_count: number
    createdAt: string
    updatedAt: string
}

const userlog = new Schema<IUserLog>({
    user_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    user_ip_address: {
        type: String
    },
    log_count: {
        type: Number
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {timestamps: true})

userlog.plugin(paginate)

const UserLogSchema = mongoose.model<IUserLog, PaginateModel<IUserLog>>("UserLog", userlog, "UserLogs")

export default UserLogSchema