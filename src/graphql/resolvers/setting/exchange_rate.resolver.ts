import { ApolloError } from "apollo-server-express"
import { verifyToken } from "../../../middleware/auth.middleware"
import ExchangeRateSchema from "../../../model/setting/exchange_rate.model"
import { message, messageError, messageLogin } from "../../../helper/message.helper"
import { getNBCExchangeRate } from "../../../helper/getExchangeRate.helper"

const exchange_rate = {
    Query: {
        getExchangeRate: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                return await ExchangeRateSchema.findOne()
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        },
        getAllExchangeRate: async () => await ExchangeRateSchema.find(),
        getNBCExchangeRate: async (_root: undefined, { }, { req }: { req: Express.Request }) => {
            try {
                // await checkAuth(req)
                const nbc = await getNBCExchangeRate('https://www.nbc.gov.kh/english/index.php')

                // const formattedAmount = nbc.toLocaleString('en-US', {
                //     style: 'currency',
                //     currency: 'USD',
                //     minimumFractionDigits: 2,
                // });

                return nbc
            } catch (error) {
                return error
            }
        },

    },
    Mutation: {
        exchangeRate: async (parent: any, args: any, context: any) => {
            try {
                const userToken: any = await verifyToken(context.user)
                if (!userToken.status) throw new ApolloError("Unauthorization")
                const ifExist: any = await ExchangeRateSchema.find()

                if (!ifExist) {
                    new ExchangeRateSchema({
                        ...args.input
                    }).save()

                    return message
                }

                await ExchangeRateSchema.findByIdAndUpdate(ifExist._id, { $set: { ...args.input } })

                return message
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    }
}

export default exchange_rate