// models/deviceSessionModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a device session
export interface IDeviceSession extends Document {
  expoToken: string;
  brand: string;
  modelD: string;
  os: string;
  version: string;
  lastActive: Date;
  lastLogin: Date;
  isVerify: boolean;
}

// Define the schema for the device session
const deviceSessionSchema = new Schema<IDeviceSession>(
  {
    expoToken: { type: String, required: true },
    brand: { type: String, default: '' },
    modelD: { type: String, default: '' },
    os: { type: String, default: '' },
    version: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    isVerify: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create the model using the interface and schema
const DeviceSession = mongoose.model<IDeviceSession>('DeviceSession', deviceSessionSchema);

export default DeviceSession
