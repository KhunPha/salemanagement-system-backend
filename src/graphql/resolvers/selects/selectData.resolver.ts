import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import BrandSchema from "../../../model/setting/brand.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";
import { ApolloError } from "apollo-server-express";
import MarketingSchema from "../../../model/marketing/marketing.model";
import StockSchema from "../../../model/stock/stocks.model";
import cloudinary from "../../../util/cloudinary";
const cron = require("node-cron")

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find().sort({ "unit_name": 1 }),
        selectBank: async () => await BankSchema.find().sort({ "bank_name": 1 }),
        selectCategory: async () => await CategoriesSchema.find().sort({ "category_name": 1 }),
        selectColor: async () => await ColorSchema.find().sort({ "color_name": 1 }),
        selectBrand: async () => await BrandSchema.find().sort({ "brand_name": 1 }),
        selectProduct: async () => await ProductSchema.find().sort({ "pro_name": 1 }),
        selectSupplier: async () => await SupplierSchema.find().sort({ "supplier_name": 1 }),
        selectCustomer: async () => await CustomerSchema.find().sort({ "customer_name": 1 })
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
