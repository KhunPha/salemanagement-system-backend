import user from "./user/user.resolver";
import bank from "./setting/bank.resolver";
import category from "./setting/categories.resolver";
import color from "./setting/color.resolver";
import supplier from "./stock/suppliers.resolver";
import customer from "./marketing/customers.resolver";
import product from "./product/products.resolver";
import unit from "./setting/unit.resolver";
import sales from "./sale/sales.resolver";
import exchange_rate from "./setting/exchange_rate.resolver";
import shop_information from "./setting/shop_information.resolver";
import marketing from "./marketing/marketing.resolver";
import stock from "./stock/stocks.resolver";
import purchase from "./stock/purchases.resolver";
import payment_purchase from "./stock/payment_purchase.resolver";
import secondhand from "./stock/second_hand.resolver";
import slicesecondhandhistory from "./stock/slice_second_hand_history.resolver";
import transferin from "./stock/transfer_in.resolver";
import transferout from "./stock/transfer_out.resolver";
import selectData from "./selects/selectData.resolver";
import receiveproduct from "./stock/receive_product.resolver";
import getstocksale from "./sale/stocksale.resolver";
import report from "./reports/report.resolver";
import shift from "./sale/shift.resolver";
import restoreMongoDb from "./restoreDatabase/restoreDatabase.resolver";
import aboutsystem from "./setting/about_system.resolver";

require("./setting/onCronSchedule.resolver")

const resolvers = [
    user,
    bank,
    category,
    color,
    supplier,
    customer,
    product,
    unit,
    sales,
    exchange_rate,
    shop_information,
    marketing,
    stock,
    purchase,
    payment_purchase,
    secondhand,
    slicesecondhandhistory,
    transferin,
    transferout,
    selectData,
    receiveproduct,
    getstocksale,
    report,
    shift,
    restoreMongoDb,
    aboutsystem
]

export default resolvers
