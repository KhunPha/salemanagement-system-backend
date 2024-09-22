import { gql } from "apollo-server-express";

const secondhand = gql`
    type GradeProductSecondHand {
        _id: ID
        pro_name: String
        category: Category
        unit: Unit
        barcode: String
        image: String,
        publicId: String
        price: Float,
        cost: Float
        remark: String,
        createdBy: User
        modifiedBy: User
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

    type SecondHandPagination {
        data: [GradeProductSecondHand]
        paginator: Paginator
    }

    input GradeProductInput {
        pro_name: String
        category: ID
        unit: ID
        barcode: String
        image: String
        publicId: String
        price: Float
        cost: Float
        remark: String
        createdAt: Date,
        updatedAt: Date,
    }

    type Query {
        getGradeProducts(page: Int, limit: Int, pagination: Boolean, keyword: String): SecondHandPagination
    }

    type Mutation {
        uploadGradeProductImage(file: Upload): imageUpload
        deleteGradeProductImage(publicId: String): Boolean
        createGradeProduct(input: GradeProductInput): ResponseMessage!
        updateGradeProduct(id: ID, input: GradeProductInput): ResponseMessage!
        deleteGradeProduct(id: ID): ResponseMessage!
    }
`

export default secondhand