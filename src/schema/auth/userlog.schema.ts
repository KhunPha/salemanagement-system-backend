import mongoose, {Schema, Document} from "mongoose";

export interface IUserLog extends Document {
    user_details: object,
    user_ip_address: string,
    log_count: number
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
    }
}, {timestamps: true})

const UserLogSchema = mongoose.model<IUserLog>("UserLog", userlog, "UserLogs")

export default UserLogSchema