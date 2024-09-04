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

        // find
        const marketingFind = await MarketingSchema.find({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const productFind = await ProductSchema.find({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        marketingFind.map((data: any) => {
            try {
                if (data.publicId)
                    new Promise(async () => {
                        await cloudinary.uploader.destroy(data.publicId)
                    })
            } catch (err: any) {
                throw new ApolloError(err.message)
            }
        })

        productFind.map((data: any) => {
            try {
                if (data.publicId)
                    new Promise(async () => {
                        await cloudinary.uploader.destroy(data.publicId)
                    })
            } catch (err: any) {
                throw new ApolloError(err.message)
            }
        })

        // delete
        const bank = await BankSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const brand = await BrandSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const category = await CategoriesSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const color = await ColorSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const unit = await UnitSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const supplier = await SupplierSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const customer = await CustomerSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const marketing = await MarketingSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const product = await ProductSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const stock = await StockSchema.deleteMany({
            $and: [
                {
                    deadline: { $lt: now }
                },
                {
                    isDelete: true
                }
            ]
        })

        const result = bank.deletedCount + brand.deletedCount + category.deletedCount + color.deletedCount + unit.deletedCount + supplier.deletedCount + customer.deletedCount + marketing.deletedCount + product.deletedCount + stock.deletedCount

        console.log(`Delete success: ${result} documents removed.`)
    } catch (error: any) {
        throw new ApolloError(error.message)
    }
})

export default selectData
