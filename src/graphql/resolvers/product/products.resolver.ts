import { ApolloError } from "apollo-server-express";
import ProductSchema from "../../../schema/product/products.schema";
import verify from "../../../helper/verifyToken.helper";
import {
  message,
  messageError,
  messageLogin,
} from "../../../helper/message.helper";
import { PaginateOptions } from "mongoose";
import { customLabels } from "../../../helper/customeLabels.helper";
import DiscountProductSchema from "../../../schema/product/discount_products.schema";
import StockSchema from "../../../schema/stock/stocks.schema";
import fs from "fs"
import sharp from "sharp";
import cloudinary from "../../../util/cloudinary";

const product = {
  Query: {
    getProducts: async (parent: any, args: any, context: any) => {
      try {
        // Verify Token
        verify(context.user);

        var { page, limit, pagination, keyword, unit, category, type_of_product } = args;
        const options: PaginateOptions = {
          pagination,
          customLabels,
          populate: [
            {
              path: "category",
            },
            {
              path: "unit",
            },
            {
              path: "color",
            },
            {
              path: "brand"
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
          ]
        }
        return await ProductSchema.paginate(query, options)
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
  },
  Mutation: {
    uploadImage: async (parent: any, args: any, context: any) => {
      try {
        verify(context.user)

        if (args.file) {
          const { createReadStream } = await args.file

          const result: any = await new Promise((resolve, reject) => {
            createReadStream()
              .pipe(cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }));
          });

          return { url: result?.url, publicId: result?.public_id, status: true }
        }

        return { url: "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769668/pyss4ndvbe2w2asi2rsy.png", publicId: "", status: true }
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    deleteImage: async (parent: any, args: any, context: any) => {
      try {
        verify(context.user)
        if (args) {
          await cloudinary.uploader.destroy(args.publicId);
          console.log("successfully")
          return true
        }

        return false
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    createProduct: async (parent: any, args: any, context: any) => {
      try {
        verify(context.user);

        const newproduct = new ProductSchema({
          ...args.input,
        });

        await newproduct.save();

        const newstock = new StockSchema({
          product_details: newproduct._id,
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
        verify(context.user);
        const { id } = args;

        const productDoc = { $set: { ...args.input } };

        const updateDoc = await ProductSchema.findByIdAndUpdate(
          id,
          productDoc,
          { new: true }
        );

        if (!updateDoc) {
          return messageError;
        }

        return message;
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
    discountProduct: async (parent: any, args: any, context: any) => {
      try {
        verify(context.user)

        const discountProduct = new DiscountProductSchema({
          ...args
        })

        await discountProduct.save()

        return message
      } catch (error: any) {
        throw new ApolloError(error.message)
      }
    },
    deleteProduct: async (parent: any, args: any, context: any) => {
      try {
        verify(context.user);
        const { id } = args;

        const deleteProduct = await ProductSchema.findByIdAndDelete(id);
        await StockSchema.findOneAndDelete({ product_details: id })

        if (!deleteProduct) {
          throw new ApolloError("Delete failed");
        }

        return message;
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
  },
};

export default product;
