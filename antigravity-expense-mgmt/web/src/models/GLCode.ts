import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGLCode extends Document {
    code: string;
    description?: string;
    tenantId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GLCodeSchema: Schema = new Schema(
    {
        code: { type: String, required: true, index: true },
        description: { type: String },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure code is unique per tenant
GLCodeSchema.index({ code: 1, tenantId: 1 }, { unique: true });

const GLCode: Model<IGLCode> = mongoose.models.GLCode || mongoose.model<IGLCode>('GLCode', GLCodeSchema);

export default GLCode;
