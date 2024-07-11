import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUnit extends Document {
    unit_name: string,
    remark: string,
    createdAt: string,
    updatedAt: string
}

const unit = new Schema<IUnit>({
    unit_name: {
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

unit.plugin(paginate)

const UnitSchema = mongoose.model<IUnit, PaginateModel<IUnit>>("Unit", unit, "Units")

export default UnitSchema