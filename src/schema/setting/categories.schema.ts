import mongoose, {Schema, Document, PaginateModel} from "mongoose"
import paginate from "mongoose-paginate-v2"

export interface ICate extends Document {
    category_name: string,
    remark: string,
    createdAt: string
    updatedAt: string
}

const cate = new Schema<ICate>({
    category_name: {
        type: String,
        required: true
    },
    remark: {
        type: String
    },
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {timestamps: true})

cate.plugin(paginate)

const CategoriesSchema = mongoose.model<ICate, PaginateModel<ICate>>("Category", cate, "Categories")

export default CategoriesSchema
