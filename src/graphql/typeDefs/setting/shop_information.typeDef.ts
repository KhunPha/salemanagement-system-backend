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
        createShopInformation(input: ShopInformationInput): Response!
        updateShopInformation(id: ID, input: ShopInformationInput): Response!
    }
`

export default shop_information