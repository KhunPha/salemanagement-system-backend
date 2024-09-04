import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IBrand extends Document {
    brand_name: string
    remark: string
    createdBy: object
    modifiedBy: object
    isDelete: boolean
    deadline: Date
}

const brand = new Schema<IBrand>({
    brand_name: {
        type: String
    },
    remark: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deadline: {
        type: Date
    }
}, { timestamps: true })

brand.plugin(paginate)

const BrandSchema = mongoose.model<IBrand, PaginateModel<IBrand>>("Brand", brand, "Brands")

export default BrandSchema