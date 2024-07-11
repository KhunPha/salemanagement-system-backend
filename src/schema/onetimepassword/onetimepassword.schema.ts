import mongoose, {Schema, Document} from "mongoose"

export interface IOneTimePassword extends Document {
    otp: string
    expireAt: String
}

const onetimepassword = new Schema<IOneTimePassword>({
    otp: {
        type: String
    },
    expireAt: {
        type: String
    }
})

const OneTimePassword = mongoose.model<IOneTimePassword>("OneTimePassword", onetimepassword, "OneTimesPassword")

export default OneTimePassword