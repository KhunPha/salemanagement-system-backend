import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IMarketing extends Document {
    title: string,
    description: string,
    image: string,
    publicId: string,
    createdBy: object
    modifiedBy: object 
    isDelete: boolean
    deadline: Date
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

marketing.plugin(paginate)

const MarketingSchema = mongoose.model<IMarketing, PaginateModel<IMarketing>>("Marketing", marketing, "Marketings")

export default MarketingSchema