import mongoose, {Schema, Document} from "mongoose";

export interface IShop extends Document {
    logo: string,
    phone_number: string,
    email_address: string,
    address: string,
    description: string
}

const shop = new Schema<IShop>({
    logo: {
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
    description: {
        type: String
    }
}, {timestamps: true})

const ShopInformationSchema = mongoose.model<IShop>("Shop", shop, "Shops")

export default ShopInformationSchema