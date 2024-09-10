import { gql } from "apollo-server-express";

const selectData = gql`
    type SelectUnit {
        _id: ID
        unit_name: String
    }

    type SelectBank {
        _id: ID
        bank_name: String
    }

    type SelectCategory {
        _id: ID
        category_name: String
    }

    type SelectColor {
        _id: ID
        color_name: String
    }

    type SelectBrand {
        _id: ID
        brand_name: String
    }

    type SelectProduct {
        _id: ID
        pro_name: String
    }

    type SelectSupplier {
        _id: ID
        supplier_name: String
    }

    type SelectCustomer {
        _id: ID
        customer_name: String
    }

    type StorageUsage {
        used: String
    }

    type Query {
        selectUnit: [SelectUnit]
        selectBank: [SelectBank]
        selectCategory: [SelectCategory]
        selectColor: [SelectColor]
        selectBrand: [SelectBrand]
        selectProduct: [SelectProduct]
        selectSupplier: [SelectSupplier]
        selectCustomer: [SelectCustomer]
        storageUsage: StorageUsage
    }
`

export default selectData
