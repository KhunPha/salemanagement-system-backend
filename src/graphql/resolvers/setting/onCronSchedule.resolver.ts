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
import { ApolloError } from "apollo-server-express";
import NotificationSchema from "../../../model/notification/notification.model";
import PurchaseSchema from "../../../model/stock/purchases.model";
const cron = require("node-cron")

// Clear Recovery
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
// 0H 1MN
cron.schedule('1 0 * * *', async () => {
    try {
        // Remove Discount
        const affectedDocumentsRemove = await DiscountProductSchema.find({
            to_date: { $lte: new Date() },
            deadline: { $ne: true },
            isActive: { $ne: false }
        })

        const affectdIdsRemove = affectedDocumentsRemove.map(doc => doc._id)

        await DiscountProductSchema.updateMany(
            {
                to_date: { $lte: new Date() },
                deadline: { $ne: true },
                isActive: { $ne: false }
            },
            { deadline: true, isActive: false }
        )

        const removeDiscount = { $set: { discount: 0, after_discount: 0, discount_id: null, discount_type: "", isDiscount: false, discount_day: null } }

        affectdIdsRemove.map(async (discount_id: any) => {
            await StockSchema.findOneAndUpdate({ discount_id }, removeDiscount)
        })

        // Add Discount
        const affectedDocumentsAdd = await DiscountProductSchema.find({
            from_date: { $lte: new Date() },
            deadline: { $ne: true },
            isActive: { $ne: true }
        })

        const affectdIdsAdd = affectedDocumentsAdd.map(doc => doc._id)

        await DiscountProductSchema.updateMany(
            {
                from_date: { $lte: new Date() },
                deadline: { $ne: true },
                isActive: { $ne: true }
            },
            { isActive: true }
        )

        affectdIdsAdd.map(async (discount_id: any) => {
            const findDiscount: any = await DiscountProductSchema.findById(discount_id)

            findDiscount?.product_id?.map(async (product_id: any) => {
                const findStock: any = await StockSchema.findOne({ product_details: product_id }).populate("product_details")

                let after_discount: number = 0;
                let discount_type = "%";
                if (findDiscount?.type == "Cash") {
                    discount_type = "$";
                    after_discount = findStock?.product_details?.price - findDiscount?.discount
                } else {
                    const price_discount = findStock?.product_details?.price * (findDiscount.discount / 100);
                    after_discount = findStock?.product_details?.price - price_discount
                }
    
                await StockSchema.findOneAndUpdate({ product_details: product_id }, { $set: { discount_id: findDiscount?._id, discount: findDiscount?.discount, after_discount, discount_type, isDiscount: true, discount_day: findDiscount.to_date } })

                console.log("Add discount successfully")
            })
        })

        // Update Date Duration
        const affectedDocumentsDuration = await DiscountProductSchema.find({
            deadline: { $ne: true },
            isActive: { $ne: false }
        })

        affectedDocumentsDuration.map(async (data: any) => {
            data.product_id.map(async (product_id: any) => {
                await StockSchema.findOneAndUpdate({ product_details: product_id }, { $set: { discount_day: data.to_date } })
            })
        })
    } catch (error: any) {
        console.error(`Error during scheduled task: ${error.message}`);
    }
});

// Notification
cron.schedule('*/1 * * * *', async () => {
    try {
        const findLowStock = await StockSchema.find({
            isNewInsert: { $ne: true },
            stock_on_hand: { $lt: 5 }
        }).populate("product_details")

        findLowStock.map(async (data: any) => {
            const findNotify = await NotificationSchema.findOne({ id_to_notify: data._id })

            if (!findNotify) {
                await new NotificationSchema({
                    name: data.product_details.pro_name,
                    title: `Low Stock ${data.stock_on_hand} items`,
                    image: data.product_details.image,
                    id_to_notify: data._id,
                    section: "Stock"
                }).save()
            }
        })

        const findDueSupplier = await PurchaseSchema.find({
            remiding_date: { $lte: new Date() },
            isVoid: { $ne: true }
        }).populate("supplier_details")

        findDueSupplier.map(async (data: any) => {
            const findNotify = await NotificationSchema.findOne({ id_to_notify: data._id, date_condition: data.remiding_date })

            if (!findNotify) {
                await new NotificationSchema({
                    name: data.supplier_details.supplier_name,
                    title: `We due ${data.supplier_details.supplier_name} ${"$" + data.due}`,
                    image: "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769668/pyss4ndvbe2w2asi2rsy.png",
                    id_to_notify: data._id,
                    section: "Purchase",
                    date_condition: data.remiding_date
                }).save()
            }
        })
    } catch (error: any) {
        throw new ApolloError(error)
    }
})