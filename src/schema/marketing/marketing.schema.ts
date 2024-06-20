import mongoose, {Schema, Document} from "mongoose";

export interface IMarketing extends Document {
    title: string,
    description: string,
    image: string,
    customer: object
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
    }]
}, {timestamps: true})

const MarketingSchema = mongoose.model<IMarketing>("Marketing", marketing, "Marketings")

export default MarketingSchema