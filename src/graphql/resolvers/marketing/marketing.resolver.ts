import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import MarketingSchema from "../../../schema/marketing/marketing.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import OneTimePassword from "../../../schema/onetimepassword/onetimepassword.schema"
const fs = require('fs');
const { promisify } = require('util');
const nodemailer = require("nodemailer")
const otpGenerator = require('otp-generator')
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import CustomerSchema from "../../../schema/marketing/customers.schema"
import TelegramSendHIstorySchema from "../../../schema/marketing/telegramSendHistory.schema"
import { UploadFileParams } from "telegram/client/uploads"


const readFileAsync = promisify(fs.readFile);


const marketing = {
    Query: {
        getMarketings: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    populate: "customer",
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    title: { $regex: keyword, $options: 'i' }
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
        emailMarketing: async (parent: any, args: any) => {
            try {
                let attachments: any = [], imageWrite: any = []
                const { customer, messages, images } = await args
                let photos: any = []
                let imageRead: any = []
                let email: any = []

                customer.map(async (value: any) => {
                    const getCustomer = await CustomerSchema.findById(value)
                    email.push(getCustomer?.email)
                })

                if (images) {
                    for (let i = 0; i < images.length; i++) {
                        photos[i] = __dirname.split("src\\")[0].concat(`public\\images\\${images[i]}`)
                        imageRead[i] = await readFileAsync(photos[i]);
                        attachments[i] = {
                            filename: images[i],
                            content: imageRead[i],
                            encoding: 'base64',
                            cid: `uniqueCID${i}`
                        }
                        imageWrite += `<img src='cid:uniqueCID${i}'>\n`
                    }
                }

                function addMinutes(date: Date, minutes: number) {
                    date.setMinutes(date.getMinutes() + minutes);
                    return date;
                }

                const expireAt = addMinutes(new Date(), 5)

                const getOTP = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })

                const createOTP = await new OneTimePassword({ otp: getOTP, expireAt }).save()

                if (createOTP) {
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
                        from: 'teangvireak189@gmail.com',
                        to: email,
                        subject: 'Teang Vireak Marketing',
                        html: `
                            <!DOCTYPE html>
                            <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Email Marketing Sales Letter</title>
                                    <style>
                                        body {
                                            font-family: Arial, sans-serif;
                                            margin: 0;
                                            padding: 0;
                                            color: #333;
                                            background-color: #f4f4f4;
                                        }
                                        .email-wrapper {
                                            width: 100%;
                                            max-width: 600px;
                                            margin: 0 auto;
                                            background: #ffffff;
                                            padding: 20px;
                                            border: 1px solid #dddddd;
                                        }
                                        .header {
                                            text-align: center;
                                            padding-bottom: 20px;
                                        }
                                        .header img {
                                            max-width: 100%;
                                            height: auto;
                                        }
                                        .content {
                                            padding: 20px;
                                        }
                                        .content h1 {
                                            font-size: 24px;
                                            color: #333;
                                        }
                                        .content p {
                                            font-size: 16px;
                                            line-height: 1.6;
                                            margin-bottom: 20px;
                                        }
                                        .cta-button {
                                            display: inline-block;
                                            padding: 10px 20px;
                                            font-size: 16px;
                                            color: #ffffff;
                                            background-color: #007bff;
                                            text-decoration: none;
                                            border-radius: 5px;
                                            text-align: center;
                                        }
                                        a .cta-button {
                                            color: white;
                                        }
                                        .cta-button:hover {
                                            background-color: #0056b3;
                                        }
                                        .footer {
                                            text-align: center;
                                            padding-top: 20px;
                                            font-size: 14px;
                                            color: #777;
                                        }
                                        .footer a {
                                            color: #007bff;
                                            text-decoration: none;
                                        }
                                        .footer a:hover {
                                            text-decoration: underline;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="email-wrapper">
                                        <!-- Header -->
                                        <div class="header">
                                            <img src="cid:uniqueCID0" alt="Company Logo">
                                        </div>
                                        <!-- Content -->
                                        <div class="content">
                                            <h1>Unlock Exclusive Offers Just for You!</h1>
                                            <p>Dear Sir/Madam,</p>
                                            <p>${messages}</p>
                                        </div>
                                        <!-- Footer -->
                                        <div class="footer">
                                            <p>If you have any questions, feel free to <a href="mailto:teangvireak189@gmail.com">contact us</a>.</p>
                                            <p>&copy; 2024 Teang Vireak. All rights reserved.</p>
                                        </div>
                                    </div>
                                </body>
                            </html>
                        `,
                        attachments: attachments
                    }

                    //send email
                    await transporter.sendMail(mailOptions, (error: any, info: any) => {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('Email send: ' + email, info.response)
                        }
                    });

                }
                // console.log(createOTP, "createOTP")
                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }

        },
        telegramMarketing: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { customer, messages, file } = await args
                var recipientUsername: any, sendSuccess = false;

                const apiId = 28257415;
                const apiHash: any = process.env.apiHash;
                const stringSession: any = new StringSession(process.env.stringSession); // fill this later with the value from session.save()

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
                        message: messages
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

                        const message = messages;

                        const filePath = `public/images/${file}`

                        new Promise(async () => {
                            try {
                                sendSuccess = await client.sendFile(recipientUsername, { file: filePath, caption: message }).then(function (value) { return true }).catch(function (error) { return false })

                                if (!sendSuccess) {
                                    sendSuccess = await client.sendMessage(recipientUsername, {
                                        message
                                    }).then(function (value) { return true }).catch(function (error) { return false })
                                }

                            } catch (error: any) {
                                throw new ApolloError(error.message)
                            }
                        })

                        if (!sendSuccess) {
                            await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer: getCustomer?._id, status: "Message send failed!" } } })
                        } else {
                            await TelegramSendHIstorySchema.updateOne({ _id: newtelegramsendhistory._id }, { $push: { customer_lists: { customer: getCustomer?._id, status: "Message sent successfully!" } } })
                        }
                        console.log("Message sent successfully")
                    }
                })();

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}


export default marketing