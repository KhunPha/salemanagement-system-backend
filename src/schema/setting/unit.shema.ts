import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
    unit_name: string,
    remark: string
}

const unit = new Schema<IUnit>({
    unit_name: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const UnitSchema = mongoose.model<IUnit>("Unit", unit, "Units")

export default UnitSchema