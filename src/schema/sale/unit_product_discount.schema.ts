import mongoose, { Schema, Document } from "mongoose";

export interface IUPDiscount extends Document {
    product_details: object,
    discount_type: string,
    discount: number,
    createdAt: string
    updatedAt: string
}

const unit_product_discount = new Schema<IUPDiscount>({
    product_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {timestamps: true})

const UPDiscountSchema = mongoose.model<IUPDiscount>("UProductDiscount", unit_product_discount, "UProductDiscounts")

export default UPDiscountSchema