import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User';

export interface IWorkflowStep extends Document {
    name: string;
    description?: string;
    approverRole: UserRole;
    order: number;
}

export interface IWorkflow extends Document {
    name: string;
    description?: string;
    tenantId: mongoose.Types.ObjectId;
    steps: IWorkflowStep[];
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const WorkflowStepSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    approverRole: {
        type: String,
        enum: Object.values(UserRole),
        required: true
    },
    order: { type: Number, required: true },
});

const WorkflowSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        steps: [WorkflowStepSchema],
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure name is unique per tenant
WorkflowSchema.index({ name: 1, tenantId: 1 }, { unique: true });

const Workflow: Model<IWorkflow> = mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);

export default Workflow;
