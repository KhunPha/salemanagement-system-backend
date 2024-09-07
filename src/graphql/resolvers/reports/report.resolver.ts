import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import StockSchema from "../../../model/stock/stocks.model"
import PurchaseSchema from "../../../model/stock/purchases.model"

const report = {
    Query: {
        dailyReport: async () => "Hello World",
        salesReport: async () => "Bye World",
        purchaseReport: async () => "Good World",
        invoiceSaleReport: async () => "Back World",
        revenueReport: async () => "Go to World",
        expenseReport: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const ExpenseData = await PurchaseSchema.find({}).populate("products_lists.product_details")

                const productSum: any = {};
                let total_qty: any = 0, total_price: any = 0, total_amount: any = 0;

                ExpenseData.map((data: any) => {
                    data.products_lists.map((product: any, index: any) => {
                        const productId = product?.product_details?._id.toString();
                        if (!productSum[productId]) {
                            console.log("Hello world")
                            productSum[productId] = { pro_name: product?.product_details?.pro_name, qty: 0, price: 0 }
                            total_amount += product.unit_price * product.qty
                        } else {
                            total_amount += product.unit_price * product.qty
                        }

                        console.log(productSum[productId])
                        productSum[productId].qty += product.qty
                        productSum[productId].price += product.unit_price
                        productSum[productId].total = productSum[productId].qty * productSum[productId].price
                        productSum[productId].discount = product.discount
                        productSum[productId].amount = productSum[productId].total
                        total_qty += product.qty
                        total_price += product.unit_price
                        total_amount += product.unit_price * product.qty
                    })
                })

                const data = Object.keys(productSum).map(productId => ({
                    pro_name: productSum[productId].pro_name,
                    qty: productSum[productId].qty,
                    price: productSum[productId].price,
                    total: productSum[productId].total,
                    discount: productSum[productId].discount,
                    amount: productSum[productId].amount
                }))

                return { data, total_qty, total_price, total_amount }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        stockReport: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const data: any = await StockSchema.find({ isDelete: { $ne: true } }).populate("product_details")
                let total = 0;

                data.map((data: any) => {
                    data.price = data.price * data.stock_on_hand;
                    data.amount = data.price - (data.price * (data.discount / 100));
                    total += data.amount;
                })

                return { data, total }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default report