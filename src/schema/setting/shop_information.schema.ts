import mongoose, {Schema, Document} from "mongoose";

export interface IShop extends Document {
    logo: string,
    store_name: string,
    phone_number: string,
    email_address: string,
    address: string,
    remark: string
}

const shop = new Schema<IShop>({
    logo: {
        type: String
    },
    store_name: {
        type: String
    },
    phone_number: {
        type: String
    },
    email_address: {
        type: String
    },
    address: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const ShopInformationSchema = mongoose.model<IShop>("Shop", shop, "Shops")

export default ShopInformationSchema