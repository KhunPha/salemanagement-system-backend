import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";
import MarketingSchema from "../../../model/marketing/marketing.model";
import StockSchema from "../../../model/stock/stocks.model";
import cloudinary from "../../../util/cloudinary";
import DiscountProductSchema from "../../../model/product/discount_products.model";
const cron = require("node-cron")

// Afternoon
cron.schedule('0 12 * * *', async () => {
    try {
        const now = new Date();

        // Find and delete media in Cloudinary
        const [marketingFind, productFind] = await Promise.all([
            MarketingSchema.find({ deadline: { $lt: now }, isDelete: true }),
            ProductSchema.find({ deadline: { $lt: now }, isDelete: true })
        ]);

        await Promise.all([
            ...marketingFind.map(async (data: any) => {
                if (data.publicId) {
                    try {
                        await cloudinary.uploader.destroy(data.publicId);
                    } catch (err: any) {
                        console.error(`Error deleting Cloudinary media for marketing: ${err.message}`);
                    }
                }
            }),
            ...productFind.map(async (data: any) => {
                if (data.publicId) {
                    try {
                        await cloudinary.uploader.destroy(data.publicId);
                    } catch (err: any) {
                        console.error(`Error deleting Cloudinary media for product: ${err.message}`);
                    }
                }
            })
        ]);

        // Delete documents from all schemas
        const schemas: any = [
            BankSchema,
            CategoriesSchema,
            ColorSchema,
            UnitSchema,
            SupplierSchema,
            CustomerSchema,
            MarketingSchema,
            ProductSchema,
            StockSchema
        ];

        const deleteResults = await Promise.all(
            schemas.map((schema: any) =>
                schema.deleteMany({ deadline: { $lt: now }, isDelete: true })
            )
        );

        const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0);

        console.log(`Delete success: ${totalDeleted} documents removed.`);
    } catch (error: any) {
        console.error(`Error during scheduled task: ${error.message}`);
    }
});

// Discount Product
// Mid Night
cron.schedule('0 0 * * *', async () => {
    try {
        await DiscountProductSchema.updateMany(
            {
                to_date: { $lte: new Date() },
                from_date: { $lte: new Date() },
                deadline: { $ne: true }
            },
            { deadline: true }
        )

        const findDiscountToRemoveDiscount: any = await DiscountProductSchema.findOne({
            to_date: { $lte: new Date() },
            deadline: { $ne: true }
        })

        const removeDiscountDoc = { $set: { discount: 0, after_discount: 0, discount_id: null, discount_type: null, isDiscount: false } }

        if (findDiscountToRemoveDiscount) {
            await DiscountProductSchema.findByIdAndUpdate(findDiscountToRemoveDiscount._id, { $set: { deadline: true, isActive: false } })

            const findStock = await StockSchema.find({ discount_id: findDiscountToRemoveDiscount._id })

            findStock.map(async (stock: any) => {
                await StockSchema.findByIdAndUpdate(stock._id, removeDiscountDoc)
            })
        }

        const findDiscountToAddDiscount: any = await DiscountProductSchema.findOne({
            from_date: { $lte: new Date() },
            to_date: { $gt: new Date() },
            deadline: { $ne: true },
            isActive: { $ne: true }
        })

        if (findDiscountToAddDiscount) {
            await DiscountProductSchema.findByIdAndUpdate(findDiscountToAddDiscount._id, { $set: { isActive: true } })

            findDiscountToAddDiscount.product_id.map(async (discountData: any) => {
                const findStock: any = await StockSchema.findOne({ product_details: discountData })

                let after_discount: number = 0;
                let discount_type = "%"
                if (findDiscountToAddDiscount.type === "Cash") {
                    discount_type = "$"
                    after_discount = findStock?.price - findDiscountToAddDiscount.discount;
                } else {
                    const price_discount = findStock?.price * (findDiscountToAddDiscount.discount / 100)
                    after_discount = findStock?.price - price_discount;
                }

                await StockSchema.findByIdAndUpdate(findStock._id, { $set: { discount_id: findDiscountToAddDiscount._id, discount: findDiscountToAddDiscount.discount, after_discount, discount_type, isDiscount: true } })
            })
        }
    } catch (error: any) {
        console.error(`Error during scheduled task: ${error.message}`);
    }
});