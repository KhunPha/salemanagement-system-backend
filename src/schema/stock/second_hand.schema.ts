import mongoose, { Schema, Document } from "mongoose";

export interface ISecondHand extends Document {
    grade_name: string
    price: number
    barcode: string
    remark: string
}

const secondhand = new Schema<ISecondHand>({
    grade_name: {
        type: String
    },
    price: {
        type: Number
    },
    barcode: {
        type: String
    },
    remark: {
        type: String
    }
})

const SecondHandSchema = mongoose.model<ISecondHand>("SecondHand", secondhand, "SecondHands")

export default SecondHandSchema