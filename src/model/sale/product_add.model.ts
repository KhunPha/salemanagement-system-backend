import mongoose, { Schema, Document } from "mongoose";

export interface IPAdd extends Document {
    sale_id: object
    product_details: object,
    qty: number
}

const product_add = new Schema<IPAdd>({
    sale_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    product_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    qty: {
        type: Number
    }
})

const ProductAddSchema = mongoose.model<IPAdd>("ProductAdd", product_add, "ProductAdds")

export default ProductAddSchema