import BankSchema from "../../../schema/setting/bank.schema";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import ColorSchema from "../../../schema/setting/color.schema";
import UnitSchema from "../../../schema/setting/unit.schema";
import BrandSchema from "../../../schema/setting/brand.schema;

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find(),
        selectBank: async () => await BankSchema.find(),
        selectCategory: async () => await CategoriesSchema.find(),
        selectColor: async () => await ColorSchema.find(),
        selectBrand: async () => await BrandSchema.find()
    }
}

export default selectData
