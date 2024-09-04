import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountProducts extends Document {
    product_id: object
    discount: number
    remark: string
    createdBy: object
    modifiedBy: object
}

const discountproduct = new Schema<IDiscountProducts>({
    product_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    discount: {
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
    },
}, { timestamps: true })

const DiscountProductSchema = mongoose.model<IDiscountProducts>("DiscountProduct", discountproduct, "DiscountProducts")

export default DiscountProductSchema