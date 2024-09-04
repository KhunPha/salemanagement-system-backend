import mongoose, { Schema, Document, PaginateModel } from "mongoose"
import paginate from "mongoose-paginate-v2"

export interface ICustomer extends Document {
    customer_name: string,
    phone_number: string,
    email: string,
    address: string,
    types: string,
    remark: string,
    createdBy: object
    modifiedBy: object
    isDelete: boolean
    deadline: Date
}

const customer = new Schema<ICustomer>({
    customer_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    types: {
        type: String,
        enum: ["VIP", "General"]
    },
    remark: {
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

customer.plugin(paginate)

const CustomerSchema = mongoose.model<ICustomer, PaginateModel<ICustomer>>("Customer", customer, "Customers")

export default CustomerSchema