import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IBrand extends Document {
    brand_name: string
    remark: string
}

const brand = new Schema<IBrand>({
    brand_name: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

brand.plugin(paginate)

const BrandSchema = mongoose.model<IBrand, PaginateModel<IBrand>>("Brand", brand, "Brands")

export default BrandSchema