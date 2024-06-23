import { gql } from "apollo-server-express";

const shop_information = gql`
    type ShopInformation {
        _id: ID
        logo: String,
        store_name: String
        phone_number: String
        email_address: String
        address: String
        remark: String
    }

    input ShopInformationInput {
        logo: String
        store_name: String
        phone_number: String
        email_address: String
        address: String
        remark: String
    }

    type Query {
        getShopInformation: ShopInformation
    }

    type Mutation {
        createShopInformation(data: ShopInformationInput): Response!
        updateShopInformation(id: ID, data: ShopInformationInput): Response!
    }
`

export default shop_information