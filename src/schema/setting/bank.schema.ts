import mongoose, {Schema, Document, PaginateModel} from "mongoose"
import paginate from "mongoose-paginate-v2"

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

bank.plugin(paginate)

const BankSchema = mongoose.model<IBank, PaginateModel<IBank>>("Bank", bank, "Banks")

export default BankSchema