import mongoose, {Schema, Document} from "mongoose"

export interface IShift extends Document {
    deposit_money: object
    shift: string
    isOpen: boolean
}

const shift = new Schema<IShift>({
    deposit_money: [
        {
            dollars: {
                type: Number
            },
            riels: {
                type: Number
            }
        }
    ],
    shift: {
        type: String
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

const ShiftSchema = mongoose.model<IShift>("Shift", shift, "Shifts")

export default ShiftSchema