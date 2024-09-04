import { ApolloError } from "apollo-server-express";
import ColorSchema from "../../../model/setting/color.model";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream";
const XLSX = require("xlsx")
const csv = require("csv-parser")
const fs = require("fs")

const color = {
    Query: {
        getColors: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
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
                    $or: [
                        keyword ? { color_code: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { color_name: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: true }
                }
                return await ColorSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getColorRecovery: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
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
                    $or: [
                        keyword ? { color_code: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { color_name: { $regex: keyword, $options: 'i' } } : {}
                    ],
                    isDelete: { $ne: false }
                }
                return await ColorSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createColor: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const newcolor = new ColorSchema({
                    ...args.input,
                    createdBy: userToken._id,
                    modifiedBy: userToken._id
                })

                await newcolor.save()

                if (!newcolor) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateColor: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = args

                const colorDoc = { $set: { ...args.input, modifiedBy: userToken._id } }

                const updateDoc = await ColorSchema.findByIdAndUpdate(id, colorDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteColor: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = args

                const now = new Date()

                const deadline = new Date(now)

                deadline.setMonth(now.getMonth() + 1)

                const updateDoc = { $set: { isDelete: true, modifiedBy: userToken._id } }

                const deleteColor = await ColorSchema.findByIdAndUpdate(id, updateDoc)

                if (!deleteColor) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importColorExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
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

                    await ColorSchema.insertMany(format)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importColorCSV: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
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
                                    await ColorSchema.insertMany(results);
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
        exportColorExcel: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data: any = await ColorSchema.find().select("-createdAt -updatedAt -__v")

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

                const filePath = `${uploadPath}/teangvireak-Color-Data-${newfilename}.xlsx`;

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportColorCSV: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const uploadPath = args.savePath ? `/app/uploads/${args.savePath}` : `/app/uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data = await ColorSchema.find().select("-createdAt -updatedAt -__v") // Fetch all documents

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

                const filePath = `${uploadPath}/teangvireak-Color-Data-${newfilename}.csv`;

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
        recoveryColor: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const { id } = args

                const updateDoc = { $set: { isDelete: false, modifiedBy: userToken._id } }

                await ColorSchema.findByIdAndUpdate(id, updateDoc)

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        recoveryColorDelete: async (parent: any, args: any, context: any) => {
            try {
                const userToken = verify(context.user)
                const {id} = args

                await ColorSchema.findByIdAndDelete(id)

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default color