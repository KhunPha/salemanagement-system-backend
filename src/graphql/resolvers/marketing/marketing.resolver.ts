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
import sharp from "sharp"
import TelegramLoginSchema from "../../../model/marketing/telegramLogin.model"
const XLSX = require("xlsx")
const csv = require("csv-parser")
const { pipeline } = require('stream');
const { promisify } = require('util');
const fetch = require('node-fetch'); // Ensure you're using node-fetch v3 or higher for modern usage

const pipelineAsync = promisify(pipeline);

const apiId: any = 28257415;
const apiHash = "5c3bd09c79301ab6119faff84a4675c0"; // fill this later with the value from session.save()
let sessions: any = {}; // In-memory storage for sessions

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
                    populate: {
                        path: "createdBy modifiedBy"
                    },
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
        },
        getUserTelegramLogin: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const telegramLogin = await TelegramLoginSchema.findOne()

                const stringSession: any = new StringSession(telegramLogin?.sessionString);

                const client: any = new TelegramClient(stringSession, apiId, apiHash, {
                    connectionRetries: 5
                });

                await client.connect();

                const loginExist = await client.getMe().then(function (value: any) { return value }).catch(function (error: any) { return false })

                if (!loginExist) {
                    const userTelegram: any = await TelegramLoginSchema.findOne()

                    if (userTelegram)
                        await TelegramLoginSchema.findByIdAndDelete(userTelegram._id)

                    sessions = {};

                    return;
                }

                return telegramLogin
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

                return { url: img, publicId: null, status: true }
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteMarketingImage: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                const findMarketing = await MarketingSchema.findOne({ publicId: args.publicId })

                if (!findMarketing) {
                    const result = await cloudinary.uploader.destroy(args.publicId).then(function (value) { return true }).catch(function (error) { return false });
                    console.log("Delete:", args.publicId)
                    return result;
                }

                return false
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        createMarketing: async (parent: any, args: any, context: any) => {
            try {
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

                if (!args.input.publicId) {
                    const findMarketing = await MarketingSchema.findById(id)
                    args.input.image = findMarketing?.image
                    args.input.publicId = findMarketing?.image
                }

                const MarketingDoc = { $set: { ...args.input, modifiedBy: userToken.data.user._id } }

                const updateDoc: any = await MarketingSchema.findByIdAndUpdate(id, MarketingDoc)

                if (args.input.publicId) {
                    if (args.input.publicId != updateDoc?.publicId)
                        try {
                            if (updateDoc?.publicId) {
                                await cloudinary.uploader.destroy(updateDoc?.publicId);
                            }
                        } catch (err: any) {
                            throw new ApolloError(err.message)
                        }
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

                if (customer.length <= 0) {
                    messageError.message_en = "Please select customer";
                    messageError.message_kh = "សូមមេត្តាជ្រើរើសអតិថិជន"

                    return messageError
                }

                const telegramLogin = await TelegramLoginSchema.findOne()

                const stringSession: any = new StringSession(telegramLogin?.sessionString);

                const marketing = await MarketingSchema.findById(marketing_id)

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                console.log("Loading interactive example...");
                const client: any = new TelegramClient(stringSession, apiId, apiHash, {
                    connectionRetries: 5
                });

                await client.connect();

                const loginExist = await client.getMe().then(function (value: any) { return value }).catch(function (error: any) { return false })

                if (!loginExist) {
                    const userTelegram: any = await TelegramLoginSchema.findOne()

                    if (userTelegram)
                        await TelegramLoginSchema.findByIdAndDelete(userTelegram._id)

                    sessions = {};

                    messageError.message_en = "Please login first";
                    messageError.message_kh = "សូមមេត្តា login សិនប្រូ"

                    return messageError
                }

                (async () => {
                    const newtelegramsendhistory: any = new TelegramSendHIstorySchema({
                        marketing_details: marketing_id
                    })

                    await newtelegramsendhistory.save()

                    const avifPath = "./public/marketing/marketing.avif";
                    const pngPath = "./public/marketing/marketing.png";

                    for (var i = 0; i < customer.length; i++) {
                        const getCustomer: any = await CustomerSchema.findById(customer[i])

                        var phonenumber: any = getCustomer?.phone_number;

                        if (phonenumber?.startsWith("0")) {
                            recipientUsername = `+855${phonenumber.slice(1).replace(/\s+/g, '')}`;
                        } else if (phonenumber?.startsWith("@")) {
                            recipientUsername = `${phonenumber}`
                        } else {
                            recipientUsername = `+855${phonenumber?.replace(/\s+/g, '')}`;
                        }

                        const title = marketing?.title

                        const message = title + "\n\n" + marketing?.description;

                        const filePath = `${marketing?.image}`

                        await downloadFile(filePath, avifPath);

                        await convertAvifToPng(avifPath, pngPath);

                        const contactUser = await client.getEntity(recipientUsername).then(function (value: any) { return value }).catch(function (error: any) { return false });

                        const clientId: any = BigInt(Date.now());

                        if (!contactUser) {
                            await client.invoke(new Api.contacts.ImportContacts({
                                contacts: [
                                    new Api.InputPhoneContact({
                                        clientId, // Using BigInt for clientId
                                        phone: recipientUsername, // Phone number should be a string
                                        firstName: getCustomer.customer_name, // Placeholder if name is unknown
                                        lastName: '', // You can leave lastName as empty or provide a value
                                    })
                                ]
                            }));
                        }

                        sendSuccess = await client.sendFile(recipientUsername, { file: pngPath, caption: message }).then(function (value: any) { return true }).catch(function (error: any) { return false })

                        if (!sendSuccess) {
                            sendSuccess = await client.sendMessage(recipientUsername, {
                                message
                            }).then(function (value: any) { return true }).catch(function (error: any) { return false })
                        }

                        if (!sendSuccess) {
                            await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer_details: getCustomer?._id, status: "Message send failed!" } } })
                        } else {
                            await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer_details: getCustomer?._id, status: "Message sent successfully!" } } })
                        }
                    }
                    deleteFiles([avifPath, pngPath], 10000);
                })();

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        telegramRequestCode: async (parent: any, args: any, context: any) => {
            const { phoneNumber } = args;

            if (typeof phoneNumber !== 'string') {
                throw new Error('Phone number must be a string');
            }

            if (!phoneNumber) {
                throw new ApolloError("Phone Number is required!")
            }

            try {
                const stringSession = new StringSession('');
                const client = new TelegramClient(stringSession, apiId, apiHash, {
                    connectionRetries: 5,
                });

                await client.connect();

                // Request a verification code
                const apiCredentials = { apiId, apiHash }

                const sentCode = await client.sendCode(apiCredentials, phoneNumber)

                // Save the session for later use
                sessions[phoneNumber] = {
                    client,
                    stringSession,
                    phoneCodeHash: sentCode.phoneCodeHash, // Save phoneCodeHash
                };

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        telegramVerifyCode: async (parent: any, args: any, context: any) => {
            const { phoneNumber, phoneCode, password } = args;

            if (!phoneNumber || !phoneCode) {
                throw new ApolloError("Phone number and code are required")
            }

            try {

                const sessionData: any = sessions[phoneNumber];

                if (!sessionData) {
                    throw new ApolloError("Session not found")
                }

                const { client, stringSession, phoneCodeHash } = sessionData

                await client.connect();

                // Sign in with the received code
                await client.start({
                    phoneNumber: () => phoneNumber,
                    password: () => password,
                    phoneCode: () => phoneCode
                });

                const { firstName, lastName, username, phone } = await client.getMe()

                const userExist: any = await TelegramLoginSchema.findOne()

                if (userExist) {
                    await TelegramLoginSchema.findByIdAndUpdate(userExist._id, {
                        $set: {
                            firstname: firstName,
                            lastname: lastName,
                            username: username,
                            phonenumber: phone,
                            sessionString: client.session.save()
                        }
                    })

                    return message
                }

                await new TelegramLoginSchema({
                    firstname: firstName,
                    lastname: lastName,
                    username: username,
                    phonenumber: phone,
                    sessionString: client.session.save()
                }).save()

                return message
            } catch (error: any) {
                throw new ApolloError('Error verifying code:', error.message);
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


const downloadFile = async (url: string, localPath: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }

    // Use pipeline to pipe the response body to a file
    const fileStream = fs.createWriteStream(localPath);

    try {
        await pipelineAsync(response.body, fileStream);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};

const convertAvifToPng = async (inputPath: any, outputPath: any) => {
    try {
        await sharp(inputPath)
            .toFormat('png') // Convert to PNG
            .toFile(outputPath); // Save it as a PNG
    } catch (error) {
        console.error('Error converting AVIF to PNG:', error);
    }
};

const deleteFiles = (filePaths: any, delay: any) => {
    setTimeout(() => {
        filePaths.forEach((filePath: any) => {
            fs.unlink(filePath, (err: any) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        });
    }, delay);
};


export default marketing