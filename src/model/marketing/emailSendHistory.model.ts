import mongoose, { Schema, Document } from "mongoose";

export interface IEmailSendHistory extends Document {
    customer_lists: object
    marketing_details: String
    createdBy: object
    modifiedBy: object 
}

const emailsendhistory = new Schema<IEmailSendHistory>({
    customer_lists: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    marketing_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Marketing"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

const EmailSendHIstorySchema = mongoose.model<IEmailSendHistory>("EmailSendHistory", emailsendhistory, "EmailSendHistories")

export default EmailSendHIstorySchema