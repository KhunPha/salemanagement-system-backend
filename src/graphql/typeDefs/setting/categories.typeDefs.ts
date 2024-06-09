import { gql } from "apollo-server-express";

const category = gql`
    type Category {
        _id: String,
        category_name: String,
        remark: String
    }

    input CateInput {
        category_name: String,
        remark: String
    }

    input CateId {
        id: String
    }

    type Query {
        getCategories: [Category]
    }

    type Mutation {
        createCategory(data: CateInput): Category
        updateCategory(id: CateId, data: CateInput): Category
        deleteCategory(id: CateId): Category
    }
`

export default category