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
        createCategory(data: CateInput): Response!
        updateCategory(id: ID!, data: CateInput): Response!
        deleteCategory(id: ID!): Response!
    }
`

export default category