import user from "./auth/user.resolver";
import bank from "./setting/bank.resolver";
import category from "./setting/categories.resolver";
import color from "./setting/color.resolver";
import supplier from "./stock/suppliers.resolver";
import customer from "./marketing/customers.resolver";

const resolvers = [
    user,
    bank,
    category,
    color,
    supplier,
    customer
]

export default resolvers
