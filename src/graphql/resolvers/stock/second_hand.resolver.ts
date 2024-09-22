import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { PaginateOptions } from "mongoose"
import { customLabels } from "../../../helper/customeLabels.helper"
import ProductSchema from "../../../model/product/products.model"
import StockSchema from "../../../model/stock/stocks.model"
import cloudinary from "../../../util/cloudinary"

const GradeProduct = {
    Query: {
        getGradeProducts: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { page, limit, pagination, keyword } = await args
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
                                keyword ? { barcode: { $regex: keyword, $options: 'i' } } : {}
                            ]
                        },
                        {
                            status: false
                        }
                    ]
                }

                return await ProductSchema.paginate(query, options)
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        uploadGradeProductImage: async (parent: any, args: any, context: any) => {
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
        deleteGradeProductImage: async (parent: any, args: any, context: any) => {
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
        createGradeProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")

                if (!args.input.publicId)
                    args.input.image = "https://res.cloudinary.com/duuux4gv5/image/upload/v1723769668/pyss4ndvbe2w2asi2rsy.png"

                const newproduct = new ProductSchema({
                    ...args.input,
                    status: false,
                    isDividedProduct: false,
                    createdBy: userToken.data.user._id,
                    modifiedBy: userToken.data.user._id
                });

                const newstock = new StockSchema({
                    isDividedProduct: false,
                    product_details: newproduct._id
                })

                if (!newproduct) {
                    return messageError;
                }

                await newproduct.save()
                await newstock.save()

                return message;
            } catch (error: any) {
                throw new ApolloError(error.message);
            }
        },
        updateGradeProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args;

                if (!args.input.publicId) {
                    const findProduct = await ProductSchema.findById(id)
                    args.input.image = findProduct?.image
                    args.input.publicId = findProduct?.publicId
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
        deleteGradeProduct: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const { id } = args;

                const deleteProduct: any = await ProductSchema.findByIdAndDelete(id);
                await StockSchema.findOneAndDelete({ product_details: id })

                if (!deleteProduct) {
                    throw new ApolloError("Delete failed");
                }

                return message;
            } catch (error: any) {
                throw new ApolloError(error.message);
            }
        }
    }
}

export default GradeProduct