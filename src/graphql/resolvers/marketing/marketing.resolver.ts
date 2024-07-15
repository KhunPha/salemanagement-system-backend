import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import MarketingSchema from "../../../schema/marketing/marketing.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import OneTimePassword from "../../../schema/onetimepassword/onetimepassword.schema"
import { title } from "process"
const fs = require('fs');
const { promisify } = require('util');
const nodemailer = require("nodemailer")
const otpGenerator = require('otp-generator')


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
        forgotPassword: async (parent: any, args: any) => {
            try {
                let attachments: any = [], imageWrite: any = []
                const { email, images } = await args
                let photos: any = []
                let imageRead: any = []

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
                //Check this email is has in system
                // const getUserByEmail = await User.findOne({ email })

                // if (!getUserByEmail) {
                //     throw new ApolloError(`${ email } not found!, ${ email } មិនមានក្នុងប្រព័ន្ធ`)
                // }
                //Function for add minutes
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
                        from: 'no-reply@fbis.com',
                        to: email,
                        subject: 'Password Recovery OTP',
                        html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8" />
                            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>Password Recovery OTP</title>
                            <style type="text/css">
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 150px;
                                height: 150px;
                            }
                        </style>
                        </head>
                        
                        <body>
                            <div> Dear Sophalanh,</div>
                            <br>
                            ${imageWrite}
                            <div>Your password recovery OTP is <b>${createOTP.otp}</b>. Verify and recover your password.</div>
                            <br>
                            <div>Yours truly,</div>
                            <div>Smart Waste Collection & Transportation</div>

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

        }
    }
}

export default marketing