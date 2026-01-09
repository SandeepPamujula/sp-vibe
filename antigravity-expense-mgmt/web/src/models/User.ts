import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    FACILITY_ADMIN = 'FACILITY_ADMIN',
    APPROVER = 'APPROVER',
    EMPLOYEE = 'EMPLOYEE',
}

export interface IUser extends Document {
    email: string;
    name: string;
    role: UserRole;
    tenantId: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
