import mongoose, { Schema, Document } from "mongoose";

export interface ISliceSecondHandHistory extends Document {
    grade_details: object
    qty: number
    price: number
}

const slicesecondhandhistory = new Schema<ISliceSecondHandHistory>({
    grade_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    qty: {
        type: Number
    }
}, { timestamps: true })

const SliceSecondHandHistorySchema = mongoose.model<ISliceSecondHandHistory>("SliceSecondHand", slicesecondhandhistory, "SliceSecondHands")

export default SliceSecondHandHistorySchema