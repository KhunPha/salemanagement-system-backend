import mongoose, {Schema, Document} from "mongoose";

export interface IPAdd extends Document {
    product_details: object,
    qty: number,
    createdAt: string,
    updatedAt: string
}

const product_add = new Schema<IPAdd>({
    product_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    qty: {
        type: Number
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {timestamps: true})

const ProductAddSchema = mongoose.model<IPAdd>("ProductAdd", product_add, "ProductAdds")

export default ProductAddSchema