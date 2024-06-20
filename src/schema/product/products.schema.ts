import mongoose, {Schema, Document} from "mongoose";

export interface IProduct extends Document {
    pro_name: string,
    brand: string,
    size: number,
    color: object
    type_of_product: string,
    category: object,
    unit: object,
    barcode: number,
    image: string,
    price: number
}

const product = new Schema<IProduct>({
    pro_name: {
        type: String
    },
    brand: {
        type: String
    },
    size: {
        type: Number
    },
    color: {
        type: mongoose.Schema.Types.ObjectId
    },
    type_of_product: {
        type: String
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category"
    },
    unit: {
        type: mongoose.Types.ObjectId,
        ref: "Unit"
    },
    barcode: {
        type: Number
    },
    image: {
        type: String
    },
    price: {
        type: Number
    }
}, {timestamps: true})

const ProductSchema = mongoose.model<IProduct>("Product", product, "Products")

export default ProductSchema