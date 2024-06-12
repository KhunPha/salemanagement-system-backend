import { gql } from "apollo-server-express";

const category = gql`
    type Category {
        _id: ID!,
        category_name: String,
        remark: String
    }

    input CateInput {
        category_name: String,
        remark: String
    }

    type Query {
        getCategories: [Category]
    }

    type Mutation {
        createCategory(data: CateInput): Category
        updateCategory(id: ID!, data: CateInput): Category
        deleteCategory(id: ID!): Category
    }
`

export default category