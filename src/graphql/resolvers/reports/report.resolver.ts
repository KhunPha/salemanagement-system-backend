import { ApolloError } from "apollo-server-express"
import StockSchema from "../../../model/stock/stocks.model"
import PurchaseSchema from "../../../model/stock/purchases.model"
import ReceiveProductTransactionSchema from "../../../model/stock/receive_product.model"
import SaleSchema from "../../../model/sale/sales.model"

const report = {
    Query: {
        dailyReport: async (parent: any, args: any, context: any) => {
            try {
                const now = new Date()
                const fromDate = new Date(now.getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z';
                const toDate = new Date(now.getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z';

                const SaleData: any = await SaleSchema.find({
                    shift_is_open: { $ne: true },
                    isSuspend: { $ne: true },
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("product_lists.product")

                const saleSum: any = {};
                let total_qty = 0, total_cost = 0, total_profit = 0;

                for (const sale of SaleData) {
                    for (const product of sale.product_lists) {
                        const saleId = product?.product?._id?.toString();

                        if (!saleSum[saleId]) {
                            saleSum[saleId] = {
                                pro_name: product?.product?.pro_name,
                                type_of_product: product?.product?.type_of_product,
                                qty: 0,
                                cost: 0,
                                profit: 0
                            };
                        }

                        saleSum[saleId].qty += product.qty;
                        total_qty += product.qty;

                        saleSum[saleId].cost += product?.product?.cost * product?.qty
                        total_cost += product?.product?.cost * product?.qty

                        saleSum[saleId].profit += (product?.amount * product?.qty) - (product?.product?.cost * product?.qty)
                        total_profit += (product?.amount * product?.qty) - (product?.product?.cost * product?.qty)
                    }
                }

                const data = Object.keys(saleSum).map(saleId => ({
                    pro_name: saleSum[saleId].pro_name,
                    type_of_product: saleSum[saleId].type_of_product,
                    qty: saleSum[saleId].qty,
                    cost: saleSum[saleId].cost,
                    profit: saleSum[saleId].profit
                }));

                return { data, total_qty, total_cost, total_profit }
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        salesReport: async (parent: any, args: any, context: any) => {
            try {
                // Step 1: Fetch all purchases with their product details
                const { from_date, to_date } = args

                // Convert from_date to UTC (subtract 7 hours)
                const fromDate = from_date
                    ? new Date(new Date(from_date).getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z'
                    : "";

                // Convert to_date to UTC (subtract 7 hours)
                const toDate = to_date
                    ? new Date(new Date(to_date).getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z'
                    : "";

                const SaleData: any = await SaleSchema.find({
                    shift_is_open: { $ne: true },
                    isSuspend: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("product_lists.product").sort({ createdAt: -1 });

                const productSum: any = {};
                let total_qty = 0, total_cost = 0, total_price = 0, total_amount = 0, total_profit = 0;

                for (const sale of SaleData) {
                    for (const product of sale.product_lists) {
                        const productId = product?.product?._id.toString();

                        // Initialize productSum entry if it doesn't exist
                        if (!productSum[productId]) {
                            productSum[productId] = {
                                pro_name: product?.product?.pro_name,
                                qty: 0,
                                cost: 0,
                                price: 0,
                                profit: 0,
                                amount: 0
                            };
                        }

                        // Sum the quantity and amount for this product
                        productSum[productId].qty += product.qty;
                        total_qty += product.qty;

                        productSum[productId].cost += product?.product?.cost * product?.qty
                        total_cost += product?.product?.cost * product?.qty

                        productSum[productId].profit += (product?.amount * product?.qty) - (product?.product?.cost * product?.qty)
                        total_profit += (product?.amount * product?.qty) - (product?.product?.cost * product?.qty)

                        const productAmount = product.amount * product.qty;
                        productSum[productId].amount += productAmount;
                        total_amount += productAmount; // Accumulate total amount for all products

                    }
                }

                // Map the data to include in the final output
                const data = Object.keys(productSum).map(productId => ({
                    pro_name: productSum[productId].pro_name,
                    qty: productSum[productId].qty,
                    cost: productSum[productId].cost,
                    profit: productSum[productId].profit,
                    sale_amount: productSum[productId].amount,
                }));

                // Log the results
                return { data, total_qty, total_amount, total_profit };
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        purchaseReport: async (parent: any, args: any, context: any) => {
            try {
                // Step 1: Fetch all purchases with their product details
                const { from_date, to_date } = args

                // Convert from_date to UTC (subtract 7 hours)
                const fromDate = from_date
                    ? new Date(new Date(from_date).getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z'
                    : "";

                // Convert to_date to UTC (subtract 7 hours)
                const toDate = to_date
                    ? new Date(new Date(to_date).getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z'
                    : "";

                const PurchaseData: any = await PurchaseSchema.find({
                    isVoid: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("products_lists.product_details").sort({ createdAt: -1 });

                const productSum: any = {};
                let total_qty = 0, total_receive = 0, total_amount = 0;

                for (const purchase of PurchaseData) {
                    const purchaseId = new Date(new Date(purchase?.date).getTime() + (7 * 60 * 60 * 1000))
                        .toISOString()
                        .split('T')[0] + 'T00:00:00.000Z';

                    if (!productSum[purchaseId]) {
                        productSum[purchaseId] = {}; // Initialize object for each revenueId
                    }

                    for (const product of purchase.products_lists) {
                        const productId = product?.product_details?._id.toString();

                        // Initialize productSum entry if it doesn't exist
                        if (!productSum[purchaseId][productId]) {
                            productSum[purchaseId][productId] = {
                                date: purchaseId,
                                pro_name: product?.product_details?.pro_name,
                                qty: 0,
                                receive: 0,
                                amount: 0
                            };
                        }

                        // Sum the quantity and amount for this product
                        productSum[purchaseId][productId].qty += product.qty;
                        total_qty += product.qty;

                        const productAmount = product.unit_price * product.qty;
                        productSum[purchaseId][productId].amount += productAmount;
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
                                    productSum[purchaseId][productId].receive += receiveQty;
                                    total_receive += receiveQty;
                                }
                            }
                        }
                    }
                }

                // Map the data to include in the final output
                const data = Object.keys(productSum).flatMap(purchaseId => {
                    return Object.keys(productSum[purchaseId]).map(productId => ({
                        date: productSum[purchaseId][productId].date, // Access correct product name
                        pro_name: productSum[purchaseId][productId].pro_name,
                        qty: productSum[purchaseId][productId].qty,
                        receive: productSum[purchaseId][productId].receive,
                        amount: productSum[purchaseId][productId].amount
                    }));
                });

                // Log the results
                return { data, total_qty, total_receive, total_amount };
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        invoiceSaleReport: async (parent: any, args: any, context: any) => {
            try {
                const { from_date, to_date, customer } = args

                // Convert from_date to UTC (subtract 7 hours)
                const fromDate = from_date
                    ? new Date(new Date(from_date).getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z'
                    : "";

                // Convert to_date to UTC (subtract 7 hours)
                const toDate = to_date
                    ? new Date(new Date(to_date).getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z'
                    : "";


                const data = await SaleSchema.find({
                    $and: [
                        { shift_is_open: { $ne: true } },
                        { isSuspend: false },
                        {
                            createdAt: {
                                $gte: fromDate,
                                $lte: toDate
                            }
                        },
                        customer ? { customer } : {}
                    ]
                }).populate("customer").sort({ createdAt: -1 });

                const total_invoice = data.length;

                return { data, total_invoice }
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        revenueReport: async (parent: any, args: any, context: any) => {
            try {
                const { from_date, to_date } = args

                // Convert from_date to UTC (subtract 7 hours)
                const fromDate = from_date
                    ? new Date(new Date(from_date).getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z'
                    : "";

                // Convert to_date to UTC (subtract 7 hours)
                const toDate = to_date
                    ? new Date(new Date(to_date).getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z'
                    : "";

                const RevenueData: any = await SaleSchema.find({
                    shift_is_open: { $ne: true },
                    isSuspend: { $ne: true },
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("product_lists.product").sort({ createdAt: -1 });

                let products: any = {};
                let total_qty = 0, total_amount = 0;

                RevenueData.map((revenueData: any) => {
                    const revenueId = new Date(new Date(revenueData?.createdAt).getTime() + (7 * 60 * 60 * 1000))
                        .toISOString()
                        .split('T')[0] + 'T00:00:00.000Z';

                    if (!products[revenueId]) {
                        products[revenueId] = {}; // Initialize object for each revenueId
                    }
                    revenueData.product_lists.map((product: any) => {
                        const productId = product?.product?._id.toString();

                        if (!products[revenueId][productId]) {
                            products[revenueId][productId] = {
                                date: revenueId,
                                product_name: product?.product?.pro_name,
                                qty: 0,
                                total_price: 0
                            }
                        }

                        products[revenueId][productId].qty += product?.qty;
                        products[revenueId][productId].total_price += product?.amount * product?.qty

                        total_qty += product?.qty;
                        total_amount += product?.amount * product?.qty
                    })
                })

                const data = Object.keys(products).flatMap(revenueId => {
                    return Object.keys(products[revenueId]).map(productId => ({
                        date: products[revenueId][productId].date, // Access correct product name
                        pro_name: products[revenueId][productId].product_name,
                        qty: products[revenueId][productId].qty,
                        total_price: products[revenueId][productId].total_price
                    }));
                });

                return { data, total_qty, total_amount }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        expenseReport: async (parent: any, args: any, context: any) => {
            try {
                const { from_date, to_date } = args

                // Convert from_date to UTC (subtract 7 hours)
                const fromDate = from_date
                    ? new Date(new Date(from_date).getTime()).toISOString().split('T')[0] + 'T00:00:00.000Z'
                    : "";

                // Convert to_date to UTC (subtract 7 hours)
                const toDate = to_date
                    ? new Date(new Date(to_date).getTime()).toISOString().split('T')[0] + 'T23:59:59.999Z'
                    : "";

                const ExpenseData: any = await PurchaseSchema.find({
                    isVoid: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("products_lists.product_details").sort({ createdAt: -1 });

                let products: any = {};
                let total_qty = 0, total_amount = 0;

                ExpenseData.map((expenseData: any) => {
                    const expenseId = new Date(new Date(expenseData?.createdAt).getTime() + (7 * 60 * 60 * 1000))
                        .toISOString()
                        .split('T')[0] + 'T00:00:00.000Z';

                    if (!products[expenseId]) {
                        products[expenseId] = {}; // Initialize object for each expenseId
                    }
                    expenseData.products_lists.map((product: any) => {
                        const productId = product?.product_details?._id.toString();

                        if (!products[expenseId][productId]) {
                            products[expenseId][productId] = {
                                date: expenseData?.date,
                                product_name: product?.product_details?.pro_name,
                                qty: 0,
                                total_price: 0
                            }
                        }

                        products[expenseId][productId].qty += product?.qty;
                        products[expenseId][productId].total_price += product?.unit_price * product?.qty

                        total_qty += product?.qty;
                        total_amount += product?.unit_price * product?.qty
                    })
                })

                const data = Object.keys(products).flatMap(expenseId => {
                    return Object.keys(products[expenseId]).map(productId => ({
                        date: products[expenseId][productId].date, // Access correct product name
                        pro_name: products[expenseId][productId].product_name,
                        qty: products[expenseId][productId].qty,
                        total_price: products[expenseId][productId].total_price
                    }));
                });

                return { data, total_qty, total_amount }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        stockReport: async (parent: any, args: any, context: any) => {
            try {
                const data: any = await StockSchema.find({ isDelete: { $ne: true }, isDividedProduct: { $ne: true } }).populate("product_details")
                let total_amount = 0;

                data.map((data: any) => {
                    data.type_of_product = data?.product_details?.type_of_product;
                    data.cost = data?.product_details?.cost;
                    data.price = data?.product_details?.price;
                    data.amount = data?.product_details?.price * data.stock_on_hand;
                    total_amount += data?.amount;
                })

                return { data, total_amount }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default report