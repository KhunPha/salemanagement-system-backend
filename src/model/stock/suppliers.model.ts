import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

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
}, { timestamps: true })

supplier.plugin(paginate)

const SupplierSchema = mongoose.model<ISuppliers, PaginateModel<ISuppliers>>("Supplier", supplier, "Suppliers")

export default SupplierSchema