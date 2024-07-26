import BankSchema from "../../../schema/setting/bank.schema";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import ColorSchema from "../../../schema/setting/color.schema";
import UnitSchema from "../../../schema/setting/unit.schema";
import BrandSchema from "../../../schema/setting/brand.schema";
import ProductSchema from "../../../schema/product/products.schema";
import SupplierSchema from "../../../schema/stock/suppliers.schema";
import CustomerSchema from "../../../schema/marketing/customers.schema";

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find().sort({"unit_name": 1}),
        selectBank: async () => await BankSchema.find().sort({"bank_name": 1}),
        selectCategory: async () => await CategoriesSchema.find().sort({"category_name": 1}),
        selectColor: async () => await ColorSchema.find().sort({"color_name": 1}),
        selectBrand: async () => await BrandSchema.find().sort({"brand_name": 1}),
        selectProduct: async () => await ProductSchema.find().sort({"pro_name": 1}),
        selectSupplier: async () => await SupplierSchema.find().sort({"supplier_name": 1}),
        selectCustomer: async () => await CustomerSchema.find().sort({"customer_name": 1})
    }
}

export default selectData
