import mongoose, {Schema, Document} from "mongoose";

export interface IColor extends Document {
    color: string,
    color_name: string,
    color_code: string,
    remark: string
}

const color = new Schema<IColor>({
    color: {
        type: String
    },
    color_name: {
        type: String
    },
    color_code: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const colors = mongoose.model<IColor>("Color", color, "Colors")

export default colors