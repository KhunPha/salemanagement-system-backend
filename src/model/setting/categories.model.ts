import mongoose, { Schema, Document, PaginateModel } from "mongoose"
import paginate from "mongoose-paginate-v2"

export interface ICate extends Document {
    category_name: string,
    remark: string
    createdBy: object
    modifiedBy: object 
    isDelete: boolean
    deadline: Date
}

const cate = new Schema<ICate>({
    category_name: {
        type: String,
        required: true
    },
    remark: {
        type: String
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
    }
}, { timestamps: true })

cate.plugin(paginate)

const CategoriesSchema = mongoose.model<ICate, PaginateModel<ICate>>("Category", cate, "Categories")

export default CategoriesSchema
