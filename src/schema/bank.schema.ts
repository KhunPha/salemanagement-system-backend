import mongoose, {Schema, Document} from "mongoose"

export interface IBank extends Document {
    banks: string,
    remark: string
}

const bank = new Schema<IBank>({
    banks: {
        type: String,
        require: true
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const banks = mongoose.model<IBank>("Bank", bank, "Banks")

export default banks