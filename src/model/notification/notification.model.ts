// src/models/notification.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    name: string
    title: string
    image: string
    read: boolean
    id_to_notify: object
    date_condition: Date
    section: string
}

const notificationSchema = new Schema<INotification>({
    name: {
        type: String
    },
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false
    },
    id_to_notify: {
        type: mongoose.Schema.Types.ObjectId
    },
    date_condition: {
        type: Date
    },
    section: {
        type: String,
        enum: ["Stock", "Purchase", "Sale"]
    }
}, { timestamps: true });

const NotificationSchema = mongoose.model<INotification>('Notification', notificationSchema, "Notifications");

export default NotificationSchema;
