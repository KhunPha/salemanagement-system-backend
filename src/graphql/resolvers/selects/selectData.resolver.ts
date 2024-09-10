import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import BrandSchema from "../../../model/setting/brand.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";
import MarketingSchema from "../../../model/marketing/marketing.model";
import StockSchema from "../../../model/stock/stocks.model";
import cloudinary from "../../../util/cloudinary";
import getStorageUsage from "../../../helper/checkcloudinary.helper";
const cron = require("node-cron")

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find({ isDelete: { $ne: true } }).sort({ "unit_name": 1 }),
        selectBank: async () => await BankSchema.find({ isDelete: { $ne: true } }).sort({ "bank_name": 1 }),
        selectCategory: async () => await CategoriesSchema.find({ isDelete: { $ne: true } }).sort({ "category_name": 1 }),
        selectColor: async () => await ColorSchema.find({ isDelete: { $ne: true } }).sort({ "color_name": 1 }),
        selectProduct: async () => await ProductSchema.find({ isDelete: { $ne: true } }).sort({ "pro_name": 1 }),
        selectSupplier: async () => await SupplierSchema.find({ isDelete: { $ne: true } }).sort({ "supplier_name": 1 }),
        selectCustomer: async () => await CustomerSchema.find({ isDelete: { $ne: true } }).sort({ "customer_name": 1 }),
        storageUsage: async () => {
            const data = await getStorageUsage();
            return { used: data };
        },
    }
}


// Clear Recycle Bin
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
            BrandSchema,
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


export default selectData
