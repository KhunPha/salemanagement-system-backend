import mongoose, {Schema, Document} from "mongoose";

export interface IMarketing extends Document {
    title: string,
    description: string
}

const marketing = new Schema<IMarketing>({
    title: {
        type: String
    },
    description: {
        type: String
    }
}, {timestamps: true})

const marketings = mongoose.model<IMarketing>("Marketing", marketing, "Marketings")

export default marketings