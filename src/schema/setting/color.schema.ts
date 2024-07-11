import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IColor extends Document {
    color_name: string,
    color_code: string,
    remark: string,
    createdAt: string
    updatedAt: string
}

const color = new Schema<IColor>({
    color_name: {
        type: String
    },
    color_code: {
        type: String
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

color.plugin(paginate)

const ColorSchema = mongoose.model<IColor, PaginateModel<IColor>>("Color", color, "Colors")

export default ColorSchema