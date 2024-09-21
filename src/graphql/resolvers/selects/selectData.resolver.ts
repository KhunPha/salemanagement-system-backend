import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";
import getStorageUsage from "../../../helper/checkcloudinary.helper";
import { ApolloError } from "apollo-server-express";

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find({ isDelete: { $ne: true } }).sort({ "unit_name": 1 }),
        selectBank: async () => await BankSchema.find({ isDelete: { $ne: true } }).sort({ "bank_name": 1 }),
        selectCategory: async () => await CategoriesSchema.find({ isDelete: { $ne: true } }).sort({ "category_name": 1 }),
        selectColor: async () => await ColorSchema.find({ isDelete: { $ne: true } }).sort({ "color_name": 1 }),
        selectProduct: async () => await ProductSchema.find({ isDelete: { $ne: true } }).sort({ "pro_name": 1 }),
        selectProductTransfer: async (parent: any, args: any, context: any) => {
            try {
                const { type_of_product } = args

                return await ProductSchema.find({
                    $and: [
                        type_of_product === "All" ? {} : { type_of_product }
                    ],
                    isDelete: { $ne: true }
                })
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        selectSupplier: async () => await SupplierSchema.find({ isDelete: { $ne: true } }).sort({ "supplier_name": 1 }),
        selectCustomer: async () => await CustomerSchema.find({ isDelete: { $ne: true } }).sort({ "customer_name": 1 }),
        storageUsage: async () => {
            const data = await getStorageUsage();
            return { used: data };
        },
    }
}

export default selectData
