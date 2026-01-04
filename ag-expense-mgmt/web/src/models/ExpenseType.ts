import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpenseType extends Document {
    name: string;
    description?: string;
    glCodeId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseTypeSchema: Schema = new Schema(
    {
        name: { type: String, required: true, index: true },
        description: { type: String },
        glCodeId: {
            type: Schema.Types.ObjectId,
            ref: 'GLCode',
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

// Compound index to ensure name is unique per tenant
ExpenseTypeSchema.index({ name: 1, tenantId: 1 }, { unique: true });

const ExpenseType: Model<IExpenseType> = mongoose.models.ExpenseType || mongoose.model<IExpenseType>('ExpenseType', ExpenseTypeSchema);

export default ExpenseType;
