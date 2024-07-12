import bank from "./setting/bank.typeDef";
import user from "./auth/user.typeDef";
import category from "./setting/categories.typeDef";
import color from "./setting/color.typeDef";
import supplier from "./stock/suppliers.typeDef";
import customer from "./marketing/customers.typeDef";
import product from "./product/products.typeDef";
import unit from "./setting/unit.typeDef";
import product_add from "./sale/product_add.typeDef";
import product_lists from "./sale/product_list.typeDef";
import unit_product_discount from "./sale/unit_product_discount.typeDef";
import sales from "./sale/sales.typeDef";
import exchange_rate from "./setting/exchange_rate.typeDef";
import shop_information from "./setting/shop_information.typeDef";
import marketing from "./marketing/marketing.typeDef";
import stock from "./stock/stocks.typeDef";
import payment_purchase from "./stock/payment_purchase.typeDef";
import purchase from "./stock/purchases.typeDef";
import secondhand from "./stock/second_hand.typeDef";
import slicesecondhandhistory from "./stock/slice_second_hand_history.typeDef";
import ResponseMessage from "./response/response.typeDef";
import transferin from "./stock/transfer_in.typeDef";
import transferout from "./stock/transfer_out.typeDef";
import selectData from "./selects/selectData.select";

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
    purchase,
    secondhand,
    slicesecondhandhistory,
    ResponseMessage,
    transferin,
    transferout,
    selectData
]

export default typeDefs