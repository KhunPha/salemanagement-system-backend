import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ISales extends Document {
    product_details: object
}

const sale = new Schema<ISales>({
    product_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    }
}, {timestamps: true})

const sales = mongoose.model<ISales>("Sale", sale, "Sales")

export default sales