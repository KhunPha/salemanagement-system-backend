import mongoose, { Schema, Document } from "mongoose";

export interface IUPDiscount extends Document {
    sale_id: object
    product_details: object,
    discount_type: string,
    discount: number
}

const unit_product_discount = new Schema<IUPDiscount>({
    sale_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    product_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    }
}, { timestamps: true })

const UPDiscountSchema = mongoose.model<IUPDiscount>("UnitProductDiscount", unit_product_discount, "UnitProductDiscounts")

export default UPDiscountSchema