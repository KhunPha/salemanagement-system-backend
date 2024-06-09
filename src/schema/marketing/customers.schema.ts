import mongoose, {Schema, Document} from "mongoose"

export interface ICustomer extends Document {
    customer_name: string,
    phone_number: string,
    email: string,
    types: string,
    remark: string
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
    types: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const CustomerSchema = mongoose.model<ICustomer>("Customer", customer, "Customers")

export default CustomerSchema