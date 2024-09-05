// src/models/notification.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    title: string;
    body: string;
    read: boolean;
}

const NotificationSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema, "Notifications");

export default Notification;
