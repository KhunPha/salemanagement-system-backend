import mongoose from "mongoose";

const sequenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: Number,
        required: true
    }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence
