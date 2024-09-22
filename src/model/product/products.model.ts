import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IProduct extends Document {
    pro_name: string,
    brand: string,
    size: string,
    color: object
    type_of_product: string,
    publicId: string
    category: object,
    unit: object,
    barcode: string,
    image: string,
    cost: number,
    price: number,
    remark: string,
    status: boolean,
    createdBy: object
    modifiedBy: object
    isDelete: boolean
    deadline: Date,
    isDividedProduct: boolean
}

const product = new Schema<IProduct>({
    pro_name: {
        type: String
    },
    brand: {
        type: String,
    },
    size: {
        type: String
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color"
    },
    type_of_product: {
        type: String,
        enum: ["New", "Second Hand"],
        default: "Second Hand"
    },
    publicId: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit"
    },
    barcode: {
        type: String
    },
    image: {
        type: String
    },
    cost: {
        type: Number
    },
    price: {
        type: Number
    },
    remark: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date
    },
    isDividedProduct: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

product.plugin(paginate)

const ProductSchema = mongoose.model<IProduct, PaginateModel<IProduct>>("Product", product, "Products")

export default ProductSchema