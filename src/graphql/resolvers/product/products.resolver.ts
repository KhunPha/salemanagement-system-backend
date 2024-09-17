import { ApolloError } from "apollo-server-express";
import ProductSchema from "../../../model/product/products.model";
import { verifyToken } from "../../../middleware/auth.middleware";
import {
  message,
  messageError,
  messageLogin,
} from "../../../helper/message.helper";
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";
import DiscountProductSchema from "../../../model/product/discount_products.model";
import StockSchema from "../../../model/stock/stocks.model";
import cloudinary from "../../../util/cloudinary";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs"
import { PassThrough } from "stream";
const XLSX = require("xlsx")
const csv = require("csv-parser")
const fs = require("fs")

const product = {
  Query: {
    getProducts: async (parent: any, args: any, context: any) => {
      try {
        // Verify Token
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")

        var { page, limit, pagination, keyword, unit, category, type_of_product } = args;
        const options: PaginateOptions = {
          pagination,
          customLabels,
          populate: [
            {
              path: "category",
              match: {
                isDelete: { $ne: true }
              }
            },
            {
              path: "unit",
              match: {
                isDelete: { $ne: true }
              }
            },
            {
              path: "color",
              match: {
                isDelete: { $ne: true }
              }
            }
          ],
          page: page,
          limit: limit,
          sort: { createdAt: -1 }
        }

        const query = {
          $and: [
            {
              $or: [
                keyword ? { pro_name: { $regex: keyword, $options: 'i' } } : {},
                keyword ? { barcode: { $regex: keyword, $options: 'i' } } : {},
              ]
            },
            {
              status: true
            },
            type_of_product === "All" ? {} : { type_of_product },
            unit ? { unit } : {},
            category ? { category } : {},
            {
              isDelete: { $ne: true }
            }
          ],
        }
        return await ProductSchema.paginate(query, options)
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
    getProductRecovery: async (parent: any, args: any, context: any) => {
      try {
        // Verify Token
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")

        var { page, limit, pagination, keyword, unit, category, type_of_product } = args;
        const options: PaginateOptions = {
          pagination,
          customLabels,
          populate: [
            {
              path: "category",
            },
            {
              path: "unit"
            },
            {
              path: "color"
            }
          ],
          page: page,
          limit: limit,
          sort: { createdAt: -1 }
        }

        const query = {
          $and: [
            {
              $or: [
                keyword ? { pro_name: { $regex: keyword, $options: 'i' } } : {},
                keyword ? { barcode: { $regex: keyword, $options: 'i' } } : {},
              ]
            },
            {
              status: true
            },
            type_of_product === "All" ? {} : { type_of_product },
            unit ? { unit } : {},
            category ? { category } : {},
          ],
          isDelete: { $ne: false }
        }
        return await ProductSchema.paginate(query, options)
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    }
  },
  Mutation: {
    uploadProductImage: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const img = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769668/pyss4ndvbe2w2asi2rsy.png"

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
    deleteProductImage: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")

        const findProduct = await ProductSchema.findOne({ publicId: args.publicId })

        if (!findProduct) {
          const result = await cloudinary.uploader.destroy(args.publicId).then(function (value) { return true }).catch(function (error) { return false });
          console.log("Delete:", args.publicId)
          return result;
        }
        return false
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    createProduct: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")

        if (!args.input.publicId)
          args.input.image = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769668/pyss4ndvbe2w2asi2rsy.png"

        const newproduct = new ProductSchema({
          ...args.input,
          createdBy: userToken.data.user._id,
          modifiedBy: userToken.data.user._id
        });

        await newproduct.save();

        const newstock = new StockSchema({
          product_details: newproduct._id,
          price: args.input.price,
          cost: args.input.cost
        })

        await newstock.save()

        if (!newproduct) {
          return messageError;
        }

        return message;
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
    updateProduct: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const { id } = args;

        if (!args.input.publicId) {
          const findProduct = await ProductSchema.findById(id)
          args.input.image = findProduct?.image
          args.input.publicId = findProduct?.image
        }

        const productDoc = { $set: { ...args.input, modifiedBy: userToken.data.user._id } };

        const updateDoc: any = await ProductSchema.findByIdAndUpdate(id, productDoc);

        if (args.input.publicId) {
          if (args.input.publicId != updateDoc?.publicId)
            try {
              if (updateDoc?.publicId) {
                new Promise(async () => {
                  await cloudinary.uploader.destroy(updateDoc?.publicId);
                })
              }
            } catch (err: any) {
              throw new ApolloError(err.message)
            }
        }

        if (!updateDoc) {
          return messageError;
        }

        return message;
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
    deleteProduct: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const { id } = args;

        const now = new Date()

        const deadline = new Date(now)

        deadline.setMonth(now.getMonth() + 1)

        const updateDoc = { $set: { isDelete: true, modifiedBy: userToken.data.user._id, deadline } }

        const deleteProduct: any = await ProductSchema.findByIdAndUpdate(id, updateDoc);
        await StockSchema.findOneAndUpdate({ product_details: id }, { $set: { isDelete: true, deadline } })

        if (!deleteProduct) {
          throw new ApolloError("Delete failed");
        }

        return message;
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
    importProductExcel: async (parent: any, args: any, context: any) => {
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

          await ProductSchema.insertMany(format)

          const stockData: any = []

          format.map(async (product: any, index: any) => {
            stockData.push({
              product_details: product._id
            })
          })

          await StockSchema.insertMany(stockData)
        });

        return message
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    importProductCSV: async (parent: any, args: any, context: any) => {
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
                  await ProductSchema.insertMany(results);

                  const stockData: any = []

                  results.map(async (product: any, index: any) => {
                    stockData.push({
                      product_details: product._id
                    })
                  })

                  await StockSchema.insertMany(stockData)
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
    exportProductExcel: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const uploadPath = args.savePath ? `${args.savePath}` : `/app/uploads`;

        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const data: any = await ProductSchema.find().select("-createdAt -updatedAt -__v")

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

        const filePath = `${uploadPath}/teangvireak-Product-Data-${newfilename}.xlsx`;

        // Write to file
        await workbook.xlsx.writeFile(filePath);

        return message
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    exportProductCSV: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const uploadPath = args.savePath ? `${args.savePath}` : `/app/uploads`;

        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const data = await ProductSchema.find().select("-createdAt -updatedAt -__v") // Fetch all documents

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

        const filePath = `${uploadPath}/teangvireak-Product-Data-${newfilename}.csv`;

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
    recoveryProduct: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const { id } = args

        const updateDoc = { $set: { isDelete: false, modifiedBy: userToken.data.user._id } }

        await ProductSchema.findByIdAndUpdate(id, updateDoc)
        await StockSchema.findOneAndUpdate({ product_details: id }, updateDoc)

        return message
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    recoveryProductDelete: async (parent: any, args: any, context: any) => {
      try {
        const userToken: any = await verifyToken(context.user)
        if (!userToken.status) throw new ApolloError("Unauthorization")
        const { id } = args

        const deleteProduct: any = await ProductSchema.findByIdAndDelete(id)
        await StockSchema.findOneAndDelete({ product_details: id })

        if (deleteProduct?.publicId)
          try {
            new Promise(async () => {
              await cloudinary.uploader.destroy(deleteProduct?.publicId)
            })
          } catch (err: any) {
            throw new ApolloError(err.message)
          }

        return message
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    }
  },
};

export default product;
