import mongoose, {Schema, Document} from "mongoose"

export interface IAboutSystem extends Document {
    title: string
    description: string
    video_url: string
    publicId: string
    section: string
}

const aboutsystem = new Schema<IAboutSystem>({
    title: {
        type: String
    },
    description: {
        type: String
    },
    video_url: {
        type: String
    },
    publicId: {
        type: String
    },
    section: {
        type: String
    }
}, { timestamps: true})

const AboutSystemSchema = mongoose.model<IAboutSystem>("AboutSystem", aboutsystem, "AboutSystems")

export default AboutSystemSchema