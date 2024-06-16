import mongoose, {Schema, Document} from "mongoose";

export interface IPAdd extends Document {
    product: object,
    qty: number
}

const product_add = new Schema<IPAdd>({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    qty: {
        type: Number
    }
}, {timestamps: true})

const ProductAddSchema = mongoose.model<IPAdd>("ProductAdd", product_add, "ProductAdds")

export default ProductAddSchema