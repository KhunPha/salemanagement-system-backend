import mongoose, { Schema, Document } from "mongoose";

export interface ISliceSecondHandHistory extends Document {
    divided_id: object
    grade_lists: object
    total_qty: number
    total_amount: number
    unit_divided: number
    remark: string
    createdBy: object
    modifiedBy: object
}

const slicesecondhandhistory = new Schema<ISliceSecondHandHistory>({
    divided_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    grade_lists: [{
        grade_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
    total_qty: {
        type: Number
    },
    total_amount: {
        type: Number
    },
    unit_divided: {
        type: Number
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
    }
}, { timestamps: true })

const SliceSecondHandHistorySchema = mongoose.model<ISliceSecondHandHistory>("SliceSecondHand", slicesecondhandhistory, "SliceSecondHands")

export default SliceSecondHandHistorySchema