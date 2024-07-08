import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IProduct extends Document {
    pro_name: string,
    brand: string,
    size: number,
    color: object
    type_of_product: string,
    category: object,
    unit: object,
    barcode: string,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color"
    },
    type_of_product: {
        type: String,
        enum: ["New", "Second_Hand"]
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
        type: String
    },
    image: {
        type: String
    },
    price: {
        type: Number
    }
}, {timestamps: true})

product.plugin(paginate)

const ProductSchema = mongoose.model<IProduct, PaginateModel<IProduct>>("Product", product, "Products")

export default ProductSchema