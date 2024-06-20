import mongoose, {Schema, Document} from "mongoose";

export interface ISliceSecondHandHistory extends Document {
    product_id: object
    grade_details: object
    qty: number
    price: number
}

const slicesecondhandhistory = new Schema<ISliceSecondHandHistory>({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    grade_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SecondHand"
    },
    qty: {
        type: Number
    },
    price: {
        type: Number
    }
}, {timestamps: true})

const SliceSecondHandHistorySchema = mongoose.model<ISliceSecondHandHistory>("SliceSecondHand", slicesecondhandhistory, "SliceSecondHands")

export default SliceSecondHandHistorySchema