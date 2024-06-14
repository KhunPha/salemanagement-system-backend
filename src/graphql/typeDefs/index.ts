import bank from "./setting/bank.typeDefs";
import user from "./auth/user.typeDefs";
import category from "./setting/categories.typeDefs";
import color from "./setting/color.typeDefs";
import supplier from "./stock/suppliers.typeDefs";
import customer from "./marketing/customers.typeDefs";
import product from "./product/products.typeDefs";
import unit from "./setting/unit.typeDefs";

const typeDefs = [
    user,
    bank,
    category,
    color,
    supplier,
    customer,
    product,
    unit
]

export default typeDefs