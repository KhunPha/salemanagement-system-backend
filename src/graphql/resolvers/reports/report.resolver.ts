import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import StockSchema from "../../../model/stock/stocks.model"
import PurchaseSchema from "../../../model/stock/purchases.model"
import ReceiveProductTransactionSchema from "../../../model/stock/receive_product.model"

const report = {
    Query: {
        dailyReport: async () => "Hello World",
        salesReport: async () => "Bye World",
        purchaseReport: async (parent: any, args: any, context: any) => {
            try {
                // Step 1: Fetch all purchases with their product details
                const { from_date, to_date } = args
                const fromDate = new Date("2024-09-23T00:00:00.000Z");
                const toDate = new Date("2024-09-23T23:59:59.999Z");

                const PurchaseData: any = await PurchaseSchema.find({
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("products_lists.product_details");

                const productSum: any = {};
                let total_qty = 0, total_receive = 0, total_amount = 0;

                for (const purchase of PurchaseData) {
                    for (const product of purchase.products_lists) {
                        const productId = product?.product_details?._id.toString();

                        // Initialize productSum entry if it doesn't exist
                        if (!productSum[productId]) {
                            productSum[productId] = {
                                pro_name: product?.product_details?.pro_name,
                                qty: 0,
                                receive: 0,
                                amount: 0
                            };
                        }

                        // Sum the quantity and amount for this product
                        productSum[productId].qty += product.qty;
                        total_qty += product.qty;

                        const productAmount = product.unit_price * product.qty;
                        productSum[productId].amount += productAmount;
                        total_amount += productAmount; // Accumulate total amount for all products

                        // Fetch the corresponding receive transaction
                        const receiveProduct: any = await ReceiveProductTransactionSchema.findOne({
                            purchase_id: purchase._id
                        });

                        if (receiveProduct?.product_lists) {
                            for (const receivedProduct of receiveProduct.product_lists) {
                                const receivedProductId = receivedProduct?.product_details.toString();

                                if (receivedProductId === productId) {
                                    // Sum the receive value for this product
                                    const receiveQty = receiveProduct !== 0 ? receivedProduct.whole * receivedProduct.retail_in_whole : receivedProduct.retail_in_whole;
                                    productSum[productId].receive += receiveQty;
                                    total_receive += receiveQty;
                                }
                            }
                        }
                    }
                }

                // Map the data to include in the final output
                const data = Object.keys(productSum).map(productId => ({
                    pro_name: productSum[productId].pro_name,
                    qty: productSum[productId].qty,
                    receive: productSum[productId].receive,
                    amount: productSum[productId].amount,
                }));

                // Log the results
                return { data, total_qty, total_receive, total_amount };
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        invoiceSaleReport: async () => "Back World",
        revenueReport: async () => "Go to World",
        expenseReport: async (parent: any, args: any, context: any) => {
            try {
                const { from_date, to_date } = args
                const fromDate = new Date("2024-09-23T00:00:00.000Z");
                const toDate = new Date("2024-09-23T23:59:59.999Z");

                const ExpenseData: any = await PurchaseSchema.find({
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("products_lists.product_details");

                const productSum: any = {};
                let total_qty: any = 0, total_price: any = 0, total_amount: any = 0;

                ExpenseData.map((data: any) => {
                    data.products_lists.map((product: any, index: any) => {
                        const productId = product?.product_details?._id.toString();
                        if (!productSum[productId]) {
                            productSum[productId] = { pro_name: product?.product_details?.pro_name, qty: 0, amount: 0 }
                            total_amount += product.unit_price * product.qty
                        } else {
                            total_amount += product.unit_price * product.qty
                        }

                        productSum[productId].qty += product.qty
                        productSum[productId].amount += product.unit_price * product.qty
                        total_qty += product.qty
                    })
                })

                const data = Object.keys(productSum).map(productId => ({
                    pro_name: productSum[productId].pro_name,
                    qty: productSum[productId].qty,
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
                const data: any = await StockSchema.find({ isDelete: { $ne: true }, isDividedProduct: { $ne: true } }).populate("product_details")
                let total = 0;

                data.map((data: any) => {
                    data.cost = data?.product_details?.cost
                    data.price = data?.product_details?.price * data?.stock_on_hand;
                    data.amount = data?.product_details?.price - (data?.product_details?.price * (data?.discount / 100));
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