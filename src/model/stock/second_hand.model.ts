import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

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

secondhand.plugin(paginate)

const SecondHandSchema = mongoose.model<ISecondHand, PaginateModel<ISecondHand>>("SecondHand", secondhand, "SecondHands")

export default SecondHandSchema