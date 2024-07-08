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
        barcode: String
        image: String,
        price: Float
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

    type ProductPagination {
        data: [Product]
        paginator: Paginator
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
        getProducts(page: Int, limit: Int, pagination: Boolean, keyword: String, unit: ID, category: ID, type_of_product: String): ProductPagination
    }

    type Mutation {
        createProduct(input: ProductInput): Response!
        updateProduct(id: ID!, input: ProductInput): Response!
        deleteProduct(id: ID): Response!
    }
`

export default product