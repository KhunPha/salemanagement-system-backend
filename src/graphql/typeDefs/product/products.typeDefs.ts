import { gql } from "apollo-server-express";

const product = gql`
    type Product {
        _id: ID
        pro_name: String
        brand: String
        size: Float
        color: Color
        type_of_product: String
        category: Category
        unit: Unit
        barcode: Int
        image: String,
        price: Float
    }

    input ProductInput {
        pro_name: String,
        brand: String
        size: Float
        color: ID
        type_of_product: String,
        category: ID
        unit: ID
        barcode: String
        image: String
        price: Float
    }

    type Query {
        getProducts(page: Int, limit: Int, search: String, filter: String): [Product]
    }

    type Mutation {
        createProduct(data: ProductInput): Product
        updateProduct(id: ID!, data: ProductInput): Product
        deleteProduct(id: ID): Product
    }
`

export default product