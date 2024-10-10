import { gql } from "apollo-server-express";

const shop_information = gql`
    type ShopInformation {
        _id: ID
        logo: String,
        store_name: String
        phone_number: String
        email: String
        address: String
        remark: String
    }

    input ShopInformationInput {
        store_name: String
        phone_number: String
        email: String
        address: String
        remark: String
    }

    type Query {
        getShopInformation: ShopInformation
    }

    type Mutation {
        shopInformation(input: ShopInformationInput, file: Upload): ResponseMessage!
    }
`

export default shop_information