import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import MarketingSchema from "../../../model/marketing/marketing.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
const fs = require('fs');
const nodemailer = require("nodemailer")
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import CustomerSchema from "../../../model/marketing/customers.model"
import TelegramSendHIstorySchema from "../../../model/marketing/telegramSendHistory.model"
import EmailSendHIstorySchema from "../../../model/marketing/emailSendHistory.model"
import cloudinary from "../../../util/cloudinary"
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream"
const XLSX = require("xlsx")
const csv = require("csv-parser")


const marketing = {
    Query: {
        getMarketings: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { title: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: true }
                }
                return await MarketingSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getTelegramSend: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                return await TelegramSendHIstorySchema.find().populate("customer_lists.customer").sort({ createdAt: -1 })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getMarketingRecovery: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        keyword ? { title: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: false }
                }
                return await MarketingSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        uploadMarketingImage: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                var img = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769679/aflwiado1kckthpmfg5m.png"

                if (args.file) {
                    const { createReadStream } = await args.file

                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image', format: 'avif' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    });

                    console.log("Upload:", result.public_id)

                    return { url: result?.url, publicId: result?.public_id, status: true }
                }

                return { url: img, publicId: "", status: true }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteMarketingImage: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                if (args) {
                    await cloudinary.uploader.destroy(args.publicId);
                    console.log("Delete:", args.publicId)
                    return true;
                }

                return false
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        createMarketing: async (parent: any, args: any, context: any) => {
            try {
                console.log(args.input)
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                if (!args.input.publicId)
                    args.input.image = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769679/aflwiado1kckthpmfg5m.png"

                const newmarketing = new MarketingSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                await newmarketing.save()

                if (!newmarketing) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateMarketing: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = await args

                const MarketingDoc = { $set: { ...args.input, modifiedBy: userToken.data.user._id } }

                const updateDoc: any = await MarketingSchema.findByIdAndUpdate(id, MarketingDoc)

                if (args.input.publicId != updateDoc?.publicId)
                    try {
                        new Promise(async () => {
                            await cloudinary.uploader.destroy(updateDoc?.publicId);
                        })
                    } catch (err: any) {
                        throw new ApolloError(err.message)
                    }

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteMarketing: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = await args

                const now = new Date()

                const deadline = new Date(now)

                deadline.setMonth(now.getMonth() + 1)

                const updateDoc = { $set: { isDelete: true, modified: userToken.data.user._id, deadline } }

                const deleteMarketing: any = await MarketingSchema.findByIdAndUpdate(id, updateDoc)

                if (!deleteMarketing) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        emailMarketing: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { customer, marketing_id } = await args
                let email: any = []

                const marketing = await MarketingSchema.findById(marketing_id)

                const emailTemplate = fs.readFileSync("./public/template/marketing.html", 'utf8');

                customer.map(async (value: any) => {
                    const getCustomer = await CustomerSchema.findById(value)
                    email.push(getCustomer?.email)
                })

                const compiledTemplate = emailTemplate.replace('{{messages}}', marketing?.description);

                const lastTemplate = compiledTemplate.replace('{{title}}', marketing?.title)
                //email transport configuration
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    tls: {
                        rejectUnauthorized: false,
                    },
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.APP_PASSWORD
                    }
                })

                //email message options
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Teang Vireak Marketing',
                    html: lastTemplate,
                    attachments: [
                        {
                            filename: "logo.png",
                            path: "./public/user/logo.png",
                            cid: `uniqueCID0`
                        },
                        {
                            filename: "marketing.png",
                            path: marketing?.image,
                            cid: `uniqueCID1`
                        }
                    ]
                }

                //send email
                await transporter.sendMail(mailOptions, async (error: any, info: any) => {
                    if (error) {
                        console.log(error)
                    } else {
                        args.marketing_details = marketing_id
                        args.customer_lists = customer

                        const telegramsendhistory = new EmailSendHIstorySchema({
                            ...args
                        })

                        await telegramsendhistory.save()
                        console.log('Email send: ' + email, info.response)
                    }
                });
                // console.log(createOTP, "createOTP")
                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }

        },
        telegramMarketing: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { customer, marketing_id } = await args
                var recipientUsername: any, sendSuccess;

                const apiId = 28257415;
                const apiHash: any = process.env.apiHash;
                const stringSession: any = new StringSession(process.env.stringSession); // fill this later with the value from session.save()

                const marketing = await MarketingSchema.findById(marketing_id)

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                (async () => {
                    console.log("Loading interactive example...");
                    const client = new TelegramClient(stringSession, apiId, apiHash, {
                        connectionRetries: 5
                    });
                    await client.start({
                        phoneNumber: async () =>
                            new Promise((resolve) =>
                                rl.question("Please enter your number: ", resolve)
                            ),
                        password: async () =>
                            new Promise((resolve) =>
                                rl.question("Please enter your password: ", resolve)
                            ),
                        phoneCode: async () =>
                            new Promise((resolve) =>
                                rl.question("Please enter the code you received: ", resolve)
                            ),
                        onError: (err) => console.log(err),
                    });
                    console.log(client.session.save());
                    console.log('Sending message...');

                    const newtelegramsendhistory: any = new TelegramSendHIstorySchema({
                        marketing_details: marketing_id
                    })

                    await newtelegramsendhistory.save()

                    for (var i = 0; i < customer.length; i++) {
                        const getCustomer = await CustomerSchema.findById(customer[i])

                        var phonenumber = getCustomer?.phone_number;

                        if (phonenumber?.startsWith("0")) {
                            recipientUsername = `+855${phonenumber.slice(1)}`;
                        } else if (phonenumber?.startsWith("@")) {
                            recipientUsername = `${phonenumber}`
                        } else {
                            recipientUsername = `+855${phonenumber}`;
                        }

                        const title = marketing?.title

                        const message = title + "\n\n\n" + marketing?.description;

                        const filePath = `${marketing?.image}`

                        new Promise(async () => {
                            try {
                                sendSuccess = await client.sendFile(recipientUsername, { file: filePath, caption: message }).then(function (value) { return true }).catch(function (error) { return false })

                                if (!sendSuccess) {
                                    sendSuccess = await client.sendMessage(recipientUsername, {
                                        message
                                    }).then(function (value) { return true }).catch(function (error) { return false })
                                }

                                if (!sendSuccess) {
                                    await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer_details: getCustomer?._id, status: "Message send failed!" } } })
                                } else {
                                    await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer_details: getCustomer?._id, status: "Message sent successfully!" } } })
                                }
                            } catch (error: any) {
                                throw new ApolloError("Send file: " + error.message)
                            }
                        })
                        console.log("Message sent successfully")
                    }
                })();

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importMarketingExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { createReadStream } = await args.file

                const chunks: Buffer[] = [];
                const readStream = createReadStream();

                readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
                readStream.on('end', async () => {
                    const buffer: any = Buffer.concat(chunks);

                    const workbook = XLSX.read(buffer);
                    const sheetName = workbook.SheetNames[0]; // Assumes the data is in the first sheet
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet)

                    const format = data.map((data: any) => ({
                        ...data,
                        _id: data._id ? data._id.replace(/"/g, "") : null
                    }))

                    await MarketingSchema.insertMany(format)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importMarketingCSV: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const results: any = [];
                const { createReadStream } = await args.file

                const chunks: Buffer[] = [];
                const readStream = createReadStream();

                readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
                readStream.on('end', async () => {
                    const buffer: any = Buffer.concat(chunks);

                    const stream = new PassThrough();
                    stream.end(buffer);

                    // Create a read stream for the CSV file
                    new Promise((resolve, reject) => {
                        stream
                            .pipe(csv())
                            .on('data', (row: any) => results.push(row))
                            .on('end', async () => {
                                try {
                                    // Insert data into MongoDB
                                    await MarketingSchema.insertMany(results);
                                    resolve('Data imported successfully');
                                } catch (err) {
                                    console.error('Error inserting data into MongoDB:', err);
                                    reject('Error importing data');
                                }
                            })
                            .on('error', (err: any) => {
                                console.error('Error reading CSV file:', err);
                                reject('Error reading CSV file');
                            });
                    });
                });
                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportMarketingExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data: any = await MarketingSchema.find().select("-createdAt -updatedAt -__v")

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Teang Vireak");

                // Define headers dynamically from the first document
                const headers = Object.keys(data[0].toObject()).map(key => ({
                    header: key.charAt(0) + key.slice(1), // Capitalize header title
                    key: key,
                    width: 20
                }));

                // Add header row
                worksheet.columns = headers;

                // Add data rows
                data.forEach((doc: any) => {
                    worksheet.addRow(doc.toObject());
                });

                const headerrows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

                // Customize styles
                for (var i = 0; i < headers.length; i++) {
                    worksheet.getCell(`${headerrows[i]}1`).font = { name: 'Calibra', bold: true, color: { argb: '000000' } }; // Bold red header
                    worksheet.getCell(`${headerrows[i]}1`).alignment = { horizontal: 'center' }; // Center align header
                    worksheet.getCell(`${headerrows[i]}1`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FDE9D9' } // Yellow fill for header
                    };
                }

                // Auto adjust column widths
                worksheet.columns.forEach((column: any) => {
                    column.width = column.width + 5; // Add padding
                });

                const name = `${Math.floor((Math.random() * 10000) + 1000)}`
                const newfilename = `${name}-${Date.now()}`;

                const filePath = `${uploadPath}/teangvireak-Marketing-Data-${newfilename}.xlsx`;

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportMarketingCSV: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data = await MarketingSchema.find().select("-createdAt -updatedAt -__v") // Fetch all documents

                if (data.length === 0) {
                    console.log('No data found in the collection.');
                    return;
                }

                // Extract headers dynamically from the first document
                const headers = Object.keys(data[0].toObject()).map(key => ({
                    id: key,
                    title: key.charAt(0) + key.slice(1) // Capitalize header title
                }));

                const name = `${Math.floor((Math.random() * 10000) + 1000)}`
                const newfilename = `${name}-${Date.now()}`;

                const filePath = `${uploadPath}/teangvireak-Marketing-Data-${newfilename}.csv`;

                // Define CSV writer configuration
                const csvWriter = createObjectCsvWriter({
                    path: filePath,
                    header: headers
                });

                // Write data to CSV
                await csvWriter.writeRecords(data.map(doc => doc.toObject())); // Convert Mongoose documents to plain objects

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        recoveryMarketing: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                const updateDoc = { $set: { isDelete: false, modifiedBy: userToken.data.user._id } }

                await MarketingSchema.findByIdAndUpdate(id, updateDoc)

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        recoveryMarketingDelete: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                const deleteMarketing: any = await MarketingSchema.findByIdAndDelete(id)

                if (deleteMarketing?.publicId)
                    try {
                        new Promise(async () => {
                            await cloudinary.uploader.destroy(deleteMarketing?.publicId)
                        })
                    } catch (err: any) {
                        throw new ApolloError(err.message)
                    }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}


export default marketing