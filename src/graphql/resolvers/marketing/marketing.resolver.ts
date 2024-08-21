import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import MarketingSchema from "../../../schema/marketing/marketing.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
const fs = require('fs');
const nodemailer = require("nodemailer")
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import CustomerSchema from "../../../schema/marketing/customers.schema"
import TelegramSendHIstorySchema from "../../../schema/marketing/telegramSendHistory.schema"
import EmailSendHIstorySchema from "../../../schema/marketing/emailSendHistory.schema"
import cloudinary from "../../../util/cloudinary"
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream"
const XLSX = require("xlsx")
const csv = require("csv-parser")


const marketing = {
    Query: {
        getMarketings: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
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
                    ]
                }
                return await MarketingSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getTelegramSend: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                return await TelegramSendHIstorySchema.find().populate("customer_lists.customer").sort({ createdAt: -1 })
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createMarketing: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                var img = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769679/aflwiado1kckthpmfg5m.png"

                if (args.file) {
                    const { createReadStream, filename, mimetype } = await args.file

                    const result: any = await new Promise((resolve, reject) => {
                        createReadStream()
                            .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            }));
                    });

                    args.input.image = `${result.url}`
                } else {
                    args.input.image = img;
                }

                const newmarketing = new MarketingSchema({
                    ...args.input
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
                verify(context.user)
                const { id } = await args

                const MarketingDoc = { $set: { ...args.input } }

                const updateDoc = await MarketingSchema.findByIdAndUpdate(id, MarketingDoc, { new: true })

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
                verify(context.user)
                const { id } = await args

                const deleteMarketing = await MarketingSchema.findByIdAndDelete(id)

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
                verify(context.user)
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
                verify(context.user)
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

                        if (getCustomer?.phone_number[0] == "0") {
                            phonenumber = getCustomer?.phone_number.substr(1)
                            recipientUsername = `+855${phonenumber}`;
                        } else if (getCustomer?.phone_number[0] === "@") {
                            recipientUsername = `${phonenumber}`
                        } else {
                            recipientUsername = `+855${phonenumber}`;
                        }

                        var emojis = [
                            '📣', '📢', '🔊', '🎉', '📌'
                        ];

                        const emote = emojis[Math.floor(Math.random() * emojis.length)];

                        const title = `${emote} ` + marketing?.title + ` ${emote}\n\n`

                        const message = title + "✈️ 🛍️ 📸 🎧 🎫 " + marketing?.description;

                        const filePath = `.${marketing?.image.split("http://localhost:8080")[1]}`

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
                verify(context.user)
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

                    await MarketingSchema.insertMany(data)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importMarketingCSV: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
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
                verify(context.user)
                const data: any = await MarketingSchema.find().select("-_id -createdAt -updatedAt -__v");

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

                const filePath = path.join(args.savePath, `teangvireak-Marketing-Data-${newfilename}.xlsx`);

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportMarketingCSV: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const data = await MarketingSchema.find().select("-_id -createdAt -updatedAt -__v"); // Fetch all documents

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

                const filePath = path.join(args.savePath, `teangvireak-Marketing-Data-${newfilename}.csv`);

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
        }
    }
}


export default marketing