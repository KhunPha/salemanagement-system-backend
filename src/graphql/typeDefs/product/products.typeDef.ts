import { gql } from "apollo-server-express";

const product = gql`
    scalar Date
    type Product {
        _id: ID
        pro_name: String
        brand: Brand
        size: String
        color: Color
        type_of_product: String
        category: Category
        unit: Unit
        barcode: String
        image: String,
        price: Float,
        discount: Float,
        remark: String,
        createdAt: Date,
        updatedAt: Date,
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

    input ProductInputs {
        pro_name: String,
        brand: ID
        size: String
        color: ID
        type_of_product: String,
        category: ID
        unit: ID
        barcode: String
        image: String
        price: Float
        remark: String
        createdAt: Date,
        updatedAt: Date,
    }

    type Query {
        getProducts(page: Int, limit: Int, pagination: Boolean, keyword: String, unit: ID, category: ID, type_of_product: String): ProductPagination
    }

    type Mutation {
        createProduct(input: ProductInputs): ResponseMessage!
        updateProduct(id: ID!, input: ProductInputs): ResponseMessage!
        discountProduct(id: [ID], discount: Float): ResponseMessage
        deleteProduct(id: ID): ResponseMessage!
    }
`

export default product