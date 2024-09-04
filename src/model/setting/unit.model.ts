import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUnit extends Document {
    unit_name: string,
    remark: string
    createdBy: object
    modifiedBy: object
    isDelete: boolean
    deadline: Date
}

const unit = new Schema<IUnit>({
    unit_name: {
        type: String
    },
    remark: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deadline: {
        type: Date
    }
}, { timestamps: true })

unit.plugin(paginate)

const UnitSchema = mongoose.model<IUnit, PaginateModel<IUnit>>("Unit", unit, "Units")

export default UnitSchema
