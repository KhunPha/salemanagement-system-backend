import user from "./auth/user.resolvers";
import bank from "./setting/bank.resolvers";
import category from "./setting/categories.resolvers";
import color from "./setting/color.resolvers";
import supplier from "./stock/suppliers.resolvers";
import customer from "./marketing/customers.resolvers";

const resolvers = [
    user,
    bank,
    category,
    color,
    supplier,
    customer
]

export default resolvers
