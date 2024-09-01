import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IMarketing extends Document {
    title: string,
    description: string,
    image: string,
    publicId: string
}

const marketing = new Schema<IMarketing>({
    title: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    publicId: {
        type: String
    }
}, { timestamps: true })

marketing.plugin(paginate)

const MarketingSchema = mongoose.model<IMarketing, PaginateModel<IMarketing>>("Marketing", marketing, "Marketings")

export default MarketingSchema