import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IMarketing extends Document {
    title: string,
    description: string,
    image: string,
    customer: object,
    createdAt: string
    updatedAt: string
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
    customer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    }],
    createdAt: {
        type: String
    },
    updatedAt: {
        type: String
    }
}, {timestamps: true})

marketing.plugin(paginate)

const MarketingSchema = mongoose.model<IMarketing, PaginateModel<IMarketing>>("Marketing", marketing, "Marketings")

export default MarketingSchema