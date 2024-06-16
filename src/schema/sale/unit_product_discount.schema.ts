import mongoose, { Schema, Document } from "mongoose";

export interface IUPDiscount extends Document {
    product: object,
    discount_type: string,
    discount: number
}

const unit_product_discount = new Schema<IUPDiscount>({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    }
}, {timestamps: true})

const UPDiscountSchema = mongoose.model<IUPDiscount>("UProductDiscount", unit_product_discount, "UProductDiscounts")

export default UPDiscountSchema