import { ApolloError } from "apollo-server-express";
import SaleSchema from "../../../model/sale/sales.model";
import PurchaseSchema from "../../../model/stock/purchases.model";

const dashboard = {
    Query: {
        topDashboard: async () => {
            try {
                const totalSales = await SaleSchema.countDocuments({ isSuspend: false });
                const RevenueData: any = await SaleSchema.find({ isSuspend: false }).populate("product_lists.product");
                const ExpenseData: any = await PurchaseSchema.find({ isVoid: false });

                // RevenueData
                let total_revenue = 0;

                RevenueData.map((revenueData: any) => {
                    revenueData.product_lists.map((product: any) => {
                        total_revenue += product?.amount * product?.qty;
                    })
                })

                // ExpenseData
                let total_expense = 0;

                ExpenseData.map((expenseData: any) => {
                    expenseData.products_lists.map((product: any) => {
                        total_expense = product?.unit_price * product?.qty;
                    })
                })

                return { totalSales: totalSales, revenueInDashboard: total_revenue, expenseInDashboard: total_expense, profitInDashboard: total_revenue - total_expense }
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        annualSalesInDashboard: async (parent: any, args: any) => {
            try {
                const { year } = args;
                const now = new Date();

                const fromDate = year ? new Date(`${year}-01-01`).toISOString().split('T')[0] + 'T00:00:00.000Z' : new Date(`${now.getFullYear()}-01-01`).toISOString().split('T')[0] + 'T00:00:00.000Z';
                const toDate = year ? new Date(`${year}-12-31`).toISOString().split('T')[0] + 'T23:59:59.999Z' : new Date(`${now.getFullYear()}-12-31`).toISOString().split('T')[0] + 'T23:59:59.999Z';

                const AnnualSaleData: any = await SaleSchema.find({
                    isSuspend: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                })

                let January = 0, February = 0, March = 0, April = 0, May = 0, June = 0, July = 0, August = 0, September = 0, October = 0, November = 0, December = 0

                AnnualSaleData.map((annualSaleData: any) => {
                    const month = annualSaleData.createdAt;

                    if (month.getMonth() == 0) {
                        January += 1
                    } else if (month.getMonth() == 1) {
                        February += 1
                    } else if (month.getMonth() == 2) {
                        March += 1
                    } else if (month.getMonth() == 3) {
                        April += 1
                    } else if (month.getMonth() == 4) {
                        May += 1
                    } else if (month.getMonth() == 5) {
                        June += 1
                    } else if (month.getMonth() == 6) {
                        July += 1
                    } else if (month.getMonth() == 7) {
                        August += 1
                    } else if (month.getMonth() == 8) {
                        September += 1
                    } else if (month.getMonth() == 9) {
                        October += 1
                    } else if (month.getMonth() == 10) {
                        November += 1
                    } else {
                        December += 1
                    }
                })

                return { January, February, March, April, May, June, July, August, September, October, November, December }
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        monthlySalesItemsInDashboard: async (parent: any, args: any) => {
            try {
                const { month } = args
                const now = new Date();
                const fromDate = month ? new Date(`${now.getFullYear}-${month}-01`).toISOString().split('T')[0] + 'T00:00:00.000Z' : new Date(`${now.getFullYear()}-${now.getMonth() + 1}-01`).toISOString().split('T')[0] + 'T00:00:00.000Z';
                const toDate = month ? new Date(`${now.getFullYear}-${month}-31`).toISOString().split('T')[0] + 'T23:59:59.999Z' : new Date(`${now.getFullYear()}-${now.getMonth() + 1}-31`).toISOString().split('T')[0] + 'T23:59:59.999Z';

                const MonthlySalesItems: any = await SaleSchema.find({
                    isSuspend: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }).populate("product_lists.product");

                let productSum: any = {};

                MonthlySalesItems.map((monthlySalesItems: any) => {
                    monthlySalesItems.product_lists.map((product: any) => {
                        const productId = product?.product?._id.toString();

                        if (!productSum[productId]) {
                            productSum[productId] = {
                                pro_name: product?.product?.pro_name,
                                qty: 0
                            }
                        }

                        productSum[productId].qty += product?.qty
                    })
                })

                interface ProductSummary {
                    pro_name: string;
                    qty: number;
                }

                const sortedProducts = Object.values(productSum) as ProductSummary[]; // Type assertion here
                sortedProducts.sort((a, b) => b.qty - a.qty);

                // Create an array of 5 entries, filling with null where necessary
                const data = Array.from({ length: 5 }, (_, index) => {
                    if (sortedProducts[index]) {
                        return {
                            pro_name: sortedProducts[index].pro_name,
                            qty: sortedProducts[index].qty
                        };
                    }
                    return { pro_name: "", qty: 0 };
                });

                return { data: data };
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default dashboard