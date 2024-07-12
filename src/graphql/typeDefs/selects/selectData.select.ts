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


    type Query {
        selectUnit: [SelectUnit]
        selectBank: [SelectBank]
        selectCategory: [SelectCategory]
    }
`

export default selectData