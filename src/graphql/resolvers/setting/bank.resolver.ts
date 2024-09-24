import { ApolloError } from "apollo-server-express";
import BankSchema from "../../../model/setting/bank.model";
import { verifyToken } from "../../../middleware/auth.middleware";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { customLabels } from "../../../helper/customeLabels.helper";
import { PaginateOptions } from "mongoose";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { GraphQLUpload } from "graphql-upload-ts";
import { PassThrough } from "stream";
const XLSX = require("xlsx")
const csv = require("csv-parser")
const fs = require("fs")

const bank = {
    Upload: GraphQLUpload,

    Query: {
        getBankPagination: async (parent: any, args: any, context: any) => {
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
                        keyword ? { bank_name: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: true }
                }
                return await BankSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getBankRecovery: async (parent: any, args: any, context: any) => {
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
                        keyword ? { bank_name: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: false }
                }
                return await BankSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createBank: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const newbank = new BankSchema({
                    ...args.input,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                })

                await newbank.save()

                if (!newbank) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateBank: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                const bankDoc = { $set: { ...args.input, modifiedBy: userToken.data.user._id } }

                const updateDoc = await BankSchema.findByIdAndUpdate(id, bankDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteBank: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args
                const now = new Date()

                const deadline = new Date(now)

                deadline.setMinutes(now.getMinutes() + 5)

                const updateDoc = { $set: { isDelete: true, modified: userToken.data.user._id, deadline } }

                const deleteBank = await BankSchema.findByIdAndUpdate(id, updateDoc)

                if (!deleteBank) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importBankExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { createReadStream } = await args.file

                const chunks: Buffer[] = [];
                const readStream = createReadStream();

                readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
                readStream.on('end', async () => {
                    const buffer: any = Buffer.concat(chunks);

                    console.log(buffer)

                    const workbook = XLSX.read(buffer);
                    const sheetName = workbook.SheetNames[0]; // Assumes the data is in the first sheet
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet)

                    const format = data.map((data: any) => ({
                        ...data,
                        _id: data._id ? data._id.replace(/"/g, "") : null
                    }))

                    await BankSchema.insertMany(format)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importBankCSV: async (parent: any, args: any, context: any) => {
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
                                    await BankSchema.insertMany(results);
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
        exportBankExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data: any = await BankSchema.find().select("-createdAt -updatedAt -__v")

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

                const filePath = `${uploadPath}/teangvireak-Bank-Data-${newfilename}.xlsx`;

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportBankCSV: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data = await BankSchema.find().select("-createdAt -updatedAt -__v") // Fetch all documents

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

                const filePath = `${uploadPath}/teangvireak-Bank-Data-${newfilename}.csv`;

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
        recoveryBank: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                const updateDoc = { $set: { isDelete: false, modifiedBy: userToken.data.user._id } }

                await BankSchema.findByIdAndUpdate(id, updateDoc)

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        recoveryManyBank: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                const { id } = args

                const updateDoc = { $set: { isDelete: false, modified: userToken.data.user._id } }

                id.map(async (id: any) => {
                    await BankSchema.findByIdAndUpdate(id, updateDoc)
                })

                return message
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        recoveryBankDelete: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args

                const recoveryBankDelete = await BankSchema.findByIdAndDelete(id)

                if (!recoveryBankDelete)
                    return messageError

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default bank