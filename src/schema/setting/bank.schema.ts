import mongoose, {Schema, Document} from "mongoose"

export interface IBank extends Document {
    bank_name: string,
    remark: string
}

const bank = new Schema<IBank>({
    bank_name: {
        type: String,
        require: true
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const BankSchema = mongoose.model<IBank>("Bank", bank, "Banks")

export default BankSchema