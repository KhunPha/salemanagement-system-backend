import mongoose, {Schema, Document} from "mongoose";

export interface ISuppliers extends Document {
    supplier_name: string,
    phone_number: string,
    address: string,
    email: string,
    remark: string
}

const supplier = new Schema<ISuppliers>({
    supplier_name: {
        type: String
    },
    phone_number: {
        type: String
    },
    address: {
        type: String
    },
    email: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const suppliers = mongoose.model<ISuppliers>("Supplier", supplier, "Suppliers")

export default suppliers