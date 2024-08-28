import { ApolloError } from "apollo-server-express"
import SupplierSchema from "../../../model/stock/suppliers.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import verify from "../../../helper/verifyToken.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream"
const XLSX = require("xlsx")
const csv = require("csv-parser")
const fs = require("fs")

const supplier = {
    Query: {
        getSuppliers: async (parent: any, args: any, context: any) => {
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
                    $or: [
                        keyword ? { supplier_name: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { phone_number: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { email: { $regex: keyword, $options: 'i' } } : {},
                        keyword ? { address: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }

                return await SupplierSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)

                const newsupplier = new SupplierSchema({
                    ...args.input
                })

                await newsupplier.save()

                if (!newsupplier) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const supplierDoc = { $set: { ...args.input } }

                const updateDoc = await SupplierSchema.findByIdAndUpdate(id, supplierDoc)

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteSupplier: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = args

                const deleteSupplier = await SupplierSchema.findByIdAndDelete(id)

                if (!deleteSupplier) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importSupplierExcel: async (parent: any, args: any, context: any) => {
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

                    const format = data.map((data: any) => ({
                        ...data,
                        _id: data._id ? data._id.replace(/"/g, "") : null
                    }))

                    await SupplierSchema.insertMany(format)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importSupplierCSV: async (parent: any, args: any, context: any) => {
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
                                    await SupplierSchema.insertMany(results);
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
        exportSupplierExcel: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const uploadPath = args.savePath ? `${args.savePath}` : ` / app / uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data: any = await SupplierSchema.find()

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
                    worksheet.getCell(`${headerrows[i]} 1`).alignment = { horizontal: 'center' }; // Center align header
                    worksheet.getCell(`${headerrows[i]} 1`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FDE9D9' } // Yellow fill for header
                    };
                }

                // Auto adjust column widths
                worksheet.columns.forEach((column: any) => {
                    column.width = column.width + 5; // Add padding
                });

                const name = `${Math.floor((Math.random() * 10000) + 1000)} `
                const newfilename = `${name}-${Date.now()}`;

                const filePath = `${uploadPath}/teangvireak-Supplier-Data-${newfilename}.xlsx`;

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportSupplierCSV: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const uploadPath = args.savePath ? `${args.savePath}` : ` / app / uploads`;

                // Ensure the directory exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                const data = await SupplierSchema.find().select("-createdAt -updatedAt -__v") // Fetch all documents

                if (data.length === 0) {
                    console.log('No data found in the collection.');
                    return;
                }

                // Extract headers dynamically from the first document
                const headers = Object.keys(data[0].toObject()).map(key => ({
                    id: key,
                    title: key.charAt(0) + key.slice(1) // Capitalize header title
                }));

                const name = `${Math.floor((Math.random() * 10000) + 1000)
                    }`
                const newfilename = `${name}-${Date.now()} `;

                const filePath = `${uploadPath}/teangvireak-Supplier-Data-${newfilename}.csv`;

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

export default supplier