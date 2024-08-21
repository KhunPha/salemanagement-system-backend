import { ApolloError } from "apollo-server-express"
import verify from "../../../helper/verifyToken.helper"
import UnitSchema from "../../../schema/setting/unit.schema"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import { PubSub } from "graphql-subscriptions"
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream"
const XLSX = require("xlsx")
const csv = require("csv-parser")

const pubsub = new PubSub()

const unit = {
    Query: {
        getUnits: async (parent: any, args: any, context: any) => {
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
                        keyword ? { unit_name: { $regex: keyword, $options: 'i' } } : {}
                    ]
                }

                return await UnitSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const newunit = new UnitSchema({
                    ...args.input
                })

                await newunit.save()

                if (!newunit) {
                    return messageError
                }

                pubsub.publish("UNIT_ADDED", { unitAdded: newunit })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const unitDoc = { $set: { ...args.input } }

                const updateDoc = await UnitSchema.findByIdAndUpdate(id, unitDoc, { new: true })

                if (!updateDoc) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const { id } = await args

                const deleteUnit = await UnitSchema.findByIdAndDelete(id)

                if (!deleteUnit) {
                    return messageError
                }

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importUnitExcel: async (parent: any, args: any, context: any) => {
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

                    await UnitSchema.insertMany(data)
                });

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        importUnitCSV: async (parent: any, args: any, context: any) => {
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
                                    await UnitSchema.insertMany(results);
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
        exportUnitExcel: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const data: any = await UnitSchema.find().select("-_id -createdAt -updatedAt -__v");

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

                const filePath = path.join(args.savePath, `teangvireak-Unit-Data-${newfilename}.xlsx`);

                // Write to file
                await workbook.xlsx.writeFile(filePath);

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        exportUnitCSV: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const data = await UnitSchema.find().select("-_id -createdAt -updatedAt -__v"); // Fetch all documents

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

                const filePath = path.join(args.savePath, `teangvireak-Unit-Data-${newfilename}.csv`);

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
    },
    Subscription: {
        unitAdded: {
            subscribe: () => pubsub.asyncIterator("UNIT_ADDED")
        }
    }
}

export default unit
