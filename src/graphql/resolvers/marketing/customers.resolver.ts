import { ApolloError } from "apollo-server-express";
import CustomerSchema from "../../../schema/marketing/customers.schema";
import verify from "../../../helper/verifyToken.helper";
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream";
const XLSX = require("xlsx")
const csv = require("csv-parser")

const customer = {
    Query: {
        getCustomers: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { page, limit, pagination, keyword, types } = await args
                const options: PaginateOptions = {
                    pagination,
                    customLabels,
                    page: page,
                    limit: limit,
                    sort: { createdAt: -1 }
                }

                const query = {
                    $and: [
                        {
                            $or: [
                                keyword ? { customer_name: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { phone_number: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { email: { $regex: keyword, $options: 'i' } } : {},
                                keyword ? { address: { $regex: keyword, $options: 'i' } } : {},
                            ]
                        },
                        types ? { types } : {}
                    ]
                }

                return await CustomerSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newcustomer = new CustomerSchema({
                    ...args.input
                })

                await newcustomer.save()

                if (!newcustomer) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const customerDoc = { $set: { ...args.input } }

                const updateDoc = await CustomerSchema.findByIdAndUpdate(id, customerDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteCustomer: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteCustomer = await CustomerSchema.findByIdAndDelete(id)

                if (!deleteCustomer) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importCustomerExcel: async (parent: any, args: any, context: any) => {
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

                    await CustomerSchema.insertMany(data)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importCustomerCSV: async (parent: any, args: any, context: any) => {
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
                                    await CustomerSchema.insertMany(results);
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
        exportCustomerExcel: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const data: any = await CustomerSchema.find().select("-_id -createdAt -updatedAt -__v");

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

                const filePath = path.join(args.savePath, `teangvireak-Customer-Data-${newfilename}.xlsx`);

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportCustomerCSV: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const data = await CustomerSchema.find().select("-_id -createdAt -updatedAt -__v"); // Fetch all documents

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

                const filePath = path.join(args.savePath, `teangvireak-Customer-Data-${newfilename}.csv`);

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

export default customer