import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";
import Notification from "../notification/notification.model";
// import { notifyLowStock } from "../../..";

export interface IStocks extends Document {
    product_details: object
    stock_on_hand: number
    discount_type: string
    discount_id: object
    discount: number
    after_discount: number
    isDiscount: boolean
    isDelete: boolean
    deadline: Date
    isNewInsert: boolean
}

const stock = new Schema<IStocks>({
    product_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    stock_on_hand: {
        type: Number,
        default: 0
    },
    discount_type: {
        type: String,
        enum: ["$", "%"]
    },
    discount_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    discount: {
        type: Number,
        default: 0
    },
    after_discount: {
        type: Number,
        default: 0
    },
    isDiscount: {
        type: Boolean,
        default: false
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date
    },
    isNewInsert: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

stock.plugin(paginate)

stock.pre('findOneAndUpdate', async function (next) {
    
    const update: any = this.getUpdate() as Partial<IStocks>; // Type assertion to ensure correct type
    // Check if update is defined and if stock_on_hand is in the update
    if (update && update.$set.stock_on_hand != null && update.$set.stock_on_hand <= 5) {
        const stockId = this.getQuery();
        try {
            await sendStockNotification(stockId, update.$set.stock_on_hand);
            // await notifyLowStock(stockId.product_details.toString(), update.$set.stock_on_hand);
        } catch (error) {
            console.error('Error sending stock notification:', error);
        }
    }
    next();
});

async function sendStockNotification(stockId: any, stockOnHand: number) {
    try {
        const stock: any = await StockSchema.findOne({product_details: stockId.product_details}).populate('product_details');
        if (stock) {
            const title = 'Stock Alert';
            const body = `The stock for product ${stock.product_details.pro_name} is running low: ${stockOnHand} items left.`;
            
            // Create a new notification
            await Notification.create({ title, body });
            
            console.log(`Notification sent for stock: ${stockId}`);
        }
    } catch (error) {
        console.error('Error sending stock notification:', error);
    }
}



const StockSchema = mongoose.model<IStocks, PaginateModel<IStocks>>("Stock", stock, "Stocks")

export default StockSchema