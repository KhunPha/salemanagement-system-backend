import BankSchema from "../../../model/setting/bank.model";
import CategoriesSchema from "../../../model/setting/categories.model";
import ColorSchema from "../../../model/setting/color.model";
import UnitSchema from "../../../model/setting/unit.model";
import ProductSchema from "../../../model/product/products.model";
import SupplierSchema from "../../../model/stock/suppliers.model";
import CustomerSchema from "../../../model/marketing/customers.model";
import MarketingSchema from "../../../model/marketing/marketing.model";
import StockSchema from "../../../model/stock/stocks.model";
import cloudinary from "../../../util/cloudinary";
import DiscountProductSchema from "../../../model/product/discount_products.model";
import { ApolloError } from "apollo-server-express";
import NotificationSchema from "../../../model/notification/notification.model";
import PurchaseSchema from "../../../model/stock/purchases.model";
import SaleSchema from "../../../model/sale/sales.model";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import Expo from "expo-server-sdk";
import UserSchema from "../../../model/user/user.model";
const cron = require("node-cron")

const expo = new Expo();

// Clear Recovery
cron.schedule('0 12 * * *', async () => {
    try {
        const now = new Date();

        // Find and delete media in Cloudinary
        const [marketingFind, productFind] = await Promise.all([
            MarketingSchema.find({ deadline: { $lt: now }, isDelete: true }),
            ProductSchema.find({ deadline: { $lt: now }, isDelete: true })
        ]);

        await Promise.all([
            ...marketingFind.map(async (data: any) => {
                if (data.publicId) {
                    try {
                        await cloudinary.uploader.destroy(data.publicId);
                    } catch (err: any) {
                        console.error(`Error deleting Cloudinary media for marketing: ${err.message}`);
                    }
                }
            }),
            ...productFind.map(async (data: any) => {
                if (data.publicId) {
                    try {
                        await cloudinary.uploader.destroy(data.publicId);
                    } catch (err: any) {
                        console.error(`Error deleting Cloudinary media for product: ${err.message}`);
                    }
                }
            })
        ]);

        // Delete documents from all schemas
        const schemas: any = [
            BankSchema,
            CategoriesSchema,
            ColorSchema,
            UnitSchema,
            SupplierSchema,
            CustomerSchema,
            MarketingSchema,
            ProductSchema,
            StockSchema
        ];

        const deleteResults = await Promise.all(
            schemas.map((schema: any) =>
                schema.deleteMany({ deadline: { $lt: now }, isDelete: true })
            )
        );

        const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0);

        console.log(`Delete success: ${totalDeleted} documents removed.`);
    } catch (error: any) {
        console.error(`Error during scheduled task: ${error.message}`);
    }
});

// Discount Product
// 0H 1MN
cron.schedule('*/1 * * * *', async () => {
    try {
        // Remove Discount
        const affectedDocumentsRemove = await DiscountProductSchema.find({
            to_date: { $lte: new Date() },
            deadline: { $ne: true },
            isActive: { $ne: false }
        })

        const affectdIdsRemove = affectedDocumentsRemove.map(doc => doc._id)

        await DiscountProductSchema.updateMany(
            {
                to_date: { $lte: new Date() },
                deadline: { $ne: true },
                isActive: { $ne: false }
            },
            { deadline: true, isActive: false }
        )


        affectdIdsRemove.map(async (discount_id: any) => {
            const findStock: any = await StockSchema.findOne({ discount_id }).populate("product_details")

            const removeDiscount = { $set: { discount: 0, after_discount: findStock?.product_details?.price, discount_id: null, discount_type: "", isDiscount: false, discount_day: null } }

            await StockSchema.findOneAndUpdate({ discount_id }, removeDiscount)
        })

        // Add Discount
        const affectedDocumentsAdd = await DiscountProductSchema.find({
            from_date: { $lte: new Date() },
            deadline: { $ne: true },
            isActive: { $ne: true }
        })

        const affectdIdsAdd = affectedDocumentsAdd.map(doc => doc._id)

        await DiscountProductSchema.updateMany(
            {
                from_date: { $lte: new Date() },
                deadline: { $ne: true },
                isActive: { $ne: true }
            },
            { isActive: true }
        )

        affectdIdsAdd.map(async (discount_id: any) => {
            const findDiscount: any = await DiscountProductSchema.findById(discount_id)

            findDiscount?.product_id?.map(async (product_id: any) => {
                const findStock: any = await StockSchema.findOne({ product_details: product_id }).populate("product_details")

                let after_discount: number = 0;
                let discount_type = "%";
                if (findDiscount?.type == "Cash") {
                    discount_type = "$";
                    after_discount = findStock?.product_details?.price - findDiscount?.discount
                } else {
                    const price_discount = findStock?.product_details?.price * (findDiscount.discount / 100);
                    after_discount = findStock?.product_details?.price - price_discount
                }

                await StockSchema.findOneAndUpdate({ product_details: product_id }, { $set: { discount_id: findDiscount?._id, discount: findDiscount?.discount, after_discount, discount_type, isDiscount: true, discount_day: findDiscount.to_date } })

                console.log("Add discount successfully")
            })
        })

        // Update Date Duration
        const affectedDocumentsDuration = await DiscountProductSchema.find({
            deadline: { $ne: true },
            isActive: { $ne: false }
        })

        affectedDocumentsDuration.map(async (data: any) => {
            data.product_id.map(async (product_id: any) => {
                await StockSchema.findOneAndUpdate({ product_details: product_id }, { $set: { discount_day: data.to_date } })
            })
        })
    } catch (error: any) {
        console.error(`Error during scheduled task: ${error.message}`);
    }
});

// Notification
cron.schedule('*/1 * * * * *', async () => {
    try {
        const findLowStock: any = await StockSchema.find({
            isNewInsert: { $ne: true },
            stock_on_hand: { $lt: 5 },
            isNotify: { $ne: false }
        }).populate("product_details")

        findLowStock.map(async (data: any) => {
            await StockSchema.findByIdAndUpdate(data?._id, { $set: { isNotify: false } })

            await new NotificationSchema({
                name: data.product_details.pro_name,
                title: `Low Stock ${data.stock_on_hand} items`,
                image: data.product_details.image,
                id_to_notify: data._id,
                section: "Stock"
            }).save()

            const users: any = await UserSchema.find({ expoPushTokens: { $ne: [] } });

            users?.forEach(async (user: any) => {
                const validTokens: any[] = user?.expoPushToken?.filter((token: any) => {
                    return Expo.isExpoPushToken(token) && token !== "";
                });

                if (!user || validTokens.length === 0) {
                    console.log('Invalid Expo Push Token or user not found');
                    return;
                }

                // Prepare the notification message
                const message: any = {
                    sound: 'default',
                    title: data?.product_details?.pro_name,
                    body: `Low Stock ${data.stock_on_hand} items`,
                    data: { extraData: 'Some data' },
                    icon: "https://icons.iconarchive.com/icons/ampeross/qetto/256/icon-developer-icon.png"
                };

                try {
                    // Send notifications for each valid token
                    await Promise.all(validTokens.map(async (token: any) => {
                        await expo.sendPushNotificationsAsync([{ ...message, to: token }]);
                    }));
                } catch (error) {
                    console.error('Error sending notification:', error);
                }
            });
        })

        const findDueSupplier = await PurchaseSchema.find({
            isNotify: { $ne: false },
            remiding_date: { $lte: new Date() },
            isVoid: { $ne: true },
            due: { $ne: 0 }
        }).populate("supplier_details")

        findDueSupplier.map(async (data: any) => {
            const findNotify = await NotificationSchema.findOne({ id_to_notify: data._id, date_condition: data.remiding_date })

            if (!findNotify) {
                await new NotificationSchema({
                    name: data.supplier_details.supplier_name,
                    title: `We owe ${data.supplier_details.supplier_name} ${"$ " + data.due}`,
                    image: "https://res.cloudinary.com/duuux4gv5/image/upload/v1727342241/pgyf08xy18mipw3dqfjg.webp",
                    id_to_notify: data._id,
                    section: "Purchase",
                    date_condition: data.remiding_date
                }).save()

                const users: any = await UserSchema.find({ expoPushTokens: { $ne: [] } });

                users?.forEach(async (user: any) => {
                    const validTokens: any[] = user?.expoPushToken?.filter((token: any) => {
                        return Expo.isExpoPushToken(token) && token !== "";
                    });

                    if (!user || validTokens.length === 0) {
                        console.log('Invalid Expo Push Token or user not found');
                        return;
                    }

                    // Prepare the notification message
                    const message: any = {
                        sound: 'default',
                        title: data.supplier_details.supplier_name,
                        body: `We owe ${data.supplier_details.supplier_name} ${"$ " + data.due}`,
                        data: { extraData: 'Some data' },
                        icon: "https://icons.iconarchive.com/icons/ampeross/qetto/256/icon-developer-icon.png"
                    };

                    try {
                        // Send notifications for each valid token
                        await Promise.all(validTokens.map(async (token: any) => {
                            await expo.sendPushNotificationsAsync([{ ...message, to: token }]);
                        }));
                    } catch (error) {
                        console.error('Error sending notification:', error);
                    }
                });
            }
        })

        const findDueCustomer = await SaleSchema.find({
            remind_status: true,
            date_remind: { $lte: new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString() },
            due: { $ne: 0 }
        }).populate("customer")

        findDueCustomer.map(async (data: any) => {
            await SaleSchema.findByIdAndUpdate(data?._id, { $set: { remind_status: false } })

            await new NotificationSchema({
                name: data?.customer?.customer_name ? data?.customer?.customer_name : "General",
                title: `${data?.customer?.customer_name ? data?.customer?.customer_name : "General"} Due ${"$ " + data?.due}`,
                image: "https://res.cloudinary.com/duuux4gv5/image/upload/v1727342242/auenm9njbjqb4ktsant2.png",
                id_to_notify: data._id,
                section: "Sale",
            }).save()

            const users: any = await UserSchema.find({ expoPushTokens: { $ne: [] } });

            users?.forEach(async (user: any) => {
                // Filter valid Expo push tokens
                const validTokens: any[] = user?.expoPushToken?.filter((token: any) => {
                    return Expo.isExpoPushToken(token) && token !== "";
                });

                if (!user || validTokens.length === 0) {
                    console.log('Invalid Expo Push Token or user not found');
                    return;
                }

                // Prepare the notification message
                const message: any = {
                    sound: 'default',
                    title: data?.customer?.customer_name ? data?.customer?.customer_name : "General",
                    body: `${data?.customer?.customer_name ? data?.customer?.customer_name : "General"} Due ${"$ " + data?.due}`,
                    data: { extraData: 'Some data' },
                    icon: "https://icons.iconarchive.com/icons/ampeross/qetto/256/icon-developer-icon.png"
                };

                try {
                    // Send notifications for each valid token
                    await Promise.all(validTokens.map(async (token: any) => {
                        await expo.sendPushNotificationsAsync([{ ...message, to: token }]);
                    }));
                } catch (error) {
                    console.error('Error sending notification:', error);
                }
            });
        })
    } catch (error: any) {
        throw new ApolloError(error)
    }
})

cron.schedule('0 0 * * *', async () => {
    try {
        // Generate a random folder name for the new backup
        const name = `${Math.floor((Math.random() * 10000) + 1000)}`;
        const newfoldername = `${name}-${Date.now()}`;

        // Define the backup directory and the path for the new backup
        const backupDir: string = 'D:/Backup';
        const newBackupPath: string = `${backupDir}/salemanagement_backup_${newfoldername}`;

        // Function to delete backups older than 1 minute
        const deleteOldBackups = (dirPath: string): void => {
            fs.readdir(dirPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
                if (err) {
                    console.error(`Error reading directory: ${err.message}`);
                    return;
                }

                files.forEach((file: string) => {
                    const filePath: string = path.join(dirPath, file);

                    // Get the stats for each file/folder
                    fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
                        if (err) {
                            console.error(`Error getting stats for file: ${err.message}`);
                            return;
                        }

                        // Check if it's a directory and calculate its age in minutes
                        if (stats.isDirectory()) {
                            const now: number = Date.now();
                            const modifiedTime: number = stats.mtime.getTime();
                            const ageInMinutes: number = (now - modifiedTime) / (1000 * 60); // Age in minutes

                            // If the folder is older than 1 minute, delete it
                            if (ageInMinutes > 1) {
                                fs.rm(filePath, { recursive: true, force: true }, (err: NodeJS.ErrnoException | null) => {
                                    if (err) {
                                        console.error(`Error deleting old backup: ${err.message}`);
                                    } else {
                                        console.log(`Deleted old backup: ${filePath}`);
                                    }
                                });
                            }
                        }
                    });
                });
            });
        };

        // Execute the mongodump command
        const command: string = `mongodump --uri="mongodb+srv://khunpha:Sopha3305@salemanagement.qbm94iq.mongodb.net/salemanagement?retryWrites=true&w=majority&appName=salemanagement" --out=${newBackupPath}`;
        exec(command, (error: Error | null, stdout: string, stderr: string): void => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error output: ${stderr}`);
                return;
            }

            console.log(`Backup successful: ${newBackupPath}`);

            // After the backup is created, delete old backups
            deleteOldBackups(backupDir);
        });
    } catch (error: any) {
        throw new ApolloError(error)
    }
})