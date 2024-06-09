import mongoose, {Schema, Document} from "mongoose"

export interface ICate extends Document {
    category_name: string,
    remark: string
}

const cate = new Schema<ICate>({
    category_name: {
        type: String,
        required: true
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const CategoriesSchema = mongoose.model<ICate>("Category", cate, "Categories")

export default CategoriesSchema
