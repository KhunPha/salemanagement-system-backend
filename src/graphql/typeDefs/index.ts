import bank from "./setting/bank.typeDefs";
import user from "./auth/user.typeDefs";
import category from "./setting/categories.typeDefs";
import color from "./setting/color.typeDefs";
import supplier from "./stock/suppliers.typeDefs";
import customer from "./marketing/customers.typeDefs";
import product from "./product/products.typeDefs";
import unit from "./setting/unit.typeDefs";
import product_add from "./sale/product_add.typeDefs";
import product_lists from "./sale/product_list.typeDefs";
import unit_product_discount from "./sale/unit_product_discount.typeDefs";
import sales from "./sale/sales.typeDefs";
import exchange_rate from "./setting/exchange_rate.typeDefs";
import shop_information from "./setting/shop_information.typeDefs";
import marketing from "./marketing/marketing.typeDefs";
import stock from "./stock/stocks.typeDefs";
import payment_purchase from "./stock/payment_purchase.typeDefs";
import purchase from "./stock/purchases.typeDefs";

const typeDefs = [
    user,
    bank,
    category,
    color,
    supplier,
    customer,
    product,
    unit,
    product_add,
    product_lists,
    unit_product_discount,
    sales,
    exchange_rate,
    shop_information,
    marketing,
    stock,
    payment_purchase,
    purchase
]

export default typeDefs