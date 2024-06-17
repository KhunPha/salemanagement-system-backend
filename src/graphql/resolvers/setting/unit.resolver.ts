import { ApolloError } from "apollo-server-express"
import verify from "../../../function/verifyToken.function"
import UnitSchema from "../../../schema/setting/unit.shema"

const unit = {
    Query: {
        getUnits: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                var { page, limit, search } = args

                if (!search) {
                    search = ""
                }

                const TUnits = await UnitSchema.find()

                const totalPages = Math.floor(TUnits.length / limit)

                const skip = (page - 1) * limit

                const units = await UnitSchema.find({
                    $or: [
                        { unit_name: { $regex: search, $options: "i" } },
                        { remark: { $regex: search, $options: "i" } }
                    ]
                }).skip(skip).limit(limit)

                return units
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
                    ...args.data
                })

                await newunit.save()

                return newunit
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        updateUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {unit_name, remark} = await args.data
                const {id} = await args
                
                const unitDoc = {$set: {unit_name, remark}}

                const updateDoc = await UnitSchema.findByIdAndUpdate(id, unit, {new: true})

                return updateDoc
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        deleteUnit: async (parent: any, args: any, context: any) => {
            try {
                verify(context.user)
                const {id} = await args

                const deleteUnit = await UnitSchema.findByIdAndDelete(id)

                return deleteUnit
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default unit