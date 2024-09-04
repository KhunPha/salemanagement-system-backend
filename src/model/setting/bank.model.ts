import mongoose, { Schema, Document, PaginateModel } from "mongoose"
import paginate from "mongoose-paginate-v2"

export interface IBank extends Document {
    bank_name: string
    remark: string
    createdBy: object
    modifiedBy: object
    isDelete: boolean
    deadline: Date
}

const bank = new Schema<IBank>({
    bank_name: {
        type: String,
        require: true
    },
    remark: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date
    }
}, { timestamps: true })

bank.plugin(paginate)

const BankSchema = mongoose.model<IBank, PaginateModel<IBank>>("Bank", bank, "Banks")

export default BankSchema