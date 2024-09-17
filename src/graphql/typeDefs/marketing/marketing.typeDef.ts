import { gql } from "apollo-server-express";

const marketing = gql`
    scalar Upload

    type Marketing {
        _id: ID
        title: String
        description: String
        image: String
        publicId: String
        createdBy: User
        modifiedBy: User
    }

    type SendDetails {
        customer_lists: [Customers]
        message: String
    }

    type Customers {
        customer_details: Customer
        status: String
    }

    type Paginator {
        slNo: Int
        prev: Int
        next: Int
        perPage: Int
        totalPosts: Int
        totalPages: Int
        currentPage: Int
        hasPrevPage: Boolean
        hasNextPage: Boolean
        totalDocs: Int
    }

    type MarketingPagination {
        data: [Marketing]
        paginator: Paginator
    }

    input MarketingInput {
        title: String
        description: String
        image: String
        publicId: String
    }

    type imageUpload {
        url: String,
        publicId: String,
        status: Boolean
    }

    type UserTelegram {
        _id: ID,
        firstname: String
        lastname: String
        username: String
        phonenumber: String
    }

    type Query {
        getMarketings(page: Int, limit: Int, pagination: Boolean, keyword: String): MarketingPagination
        getTelegramSend: [SendDetails]
        getEmailSend: [SendDetails]
        getMarketingRecovery(page: Int, limit: Int, pagination: Boolean, keyword: String): MarketingPagination
        getUserTelegramLogin: UserTelegram
    }

    type Mutation {
        uploadMarketingImage(file: Upload): imageUpload
        deleteMarketingImage(publicId: String): Boolean
        createMarketing(input: MarketingInput): ResponseMessage!
        updateMarketing(id: ID, input: MarketingInput): ResponseMessage!
        deleteMarketing(id: ID): ResponseMessage!
        emailMarketing(customer: [ID], marketing_id: ID): ResponseMessage!
        telegramMarketing(customer: [ID], marketing_id: ID): ResponseMessage!
        telegramRequestCode(phoneNumber: String): ResponseMessage!
        telegramVerifyCode(phoneNumber: String, phoneCode: String, password: String): ResponseMessage!
        telegramLogout: ResponseMessage!
        importMarketingExcel(file: Upload!): ResponseMessage!
        importMarketingCSV(file: Upload!): ResponseMessage!
        exportMarketingExcel(savePath: String!): ResponseMessage!
        exportMarketingCSV(savePath: String!): ResponseMessage!
        recoveryMarketing(id: ID!): ResponseMessage!
        recoveryMarketingDelete(id: ID!): ResponseMessage!
    }
`

export default marketing