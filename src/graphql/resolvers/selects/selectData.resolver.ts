import BankSchema from "../../../schema/setting/bank.schema";
import CategoriesSchema from "../../../schema/setting/categories.schema";
import UnitSchema from "../../../schema/setting/unit.shema";

const selectData = {
    Query: {
        selectUnit: async () => await UnitSchema.find(),
        selectBank: async () => await BankSchema.find(),
        selectCategory: async () => await CategoriesSchema.find()
    }
}

export default selectData