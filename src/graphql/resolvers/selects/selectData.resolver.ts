import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import BrandSchema from "../../../model/setting/brand.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";

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

export default selectData
