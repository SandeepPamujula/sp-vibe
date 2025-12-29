/**
 * ExpenseSubmissionForm Component
 *
 * Complete form for creating and submitting petty expenses.
 * Handles form state, validation, file uploads, and submission workflow.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

import { Input, DateInput, CurrencyInput, Textarea, Button, Spinner } from '@/components/atoms';
import {
  FormRow,
  FormField,
  FormSection,
  FileUploadZone,
  NatureOfExpenseSelect,
} from '@/components/molecules';
import type { FileWithPreview } from '@/components/molecules/FileUploadZone';
import { useFileUpload } from '@/hooks';
import type { NatureOfExpenseOption } from '@/types/dto/nature-of-expense.dto';
import { toNatureOfExpenseOptions } from '@/types/dto/nature-of-expense.dto';

// Helper functions for file display
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string | undefined): string {
  if (!mimeType) return '📎';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  return '📎';
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

interface FormData {
  expenseDate: string;
  invoiceNumber: string;
  vendorName: string;
  amount: string;
  natureOfExpense: string;
  purpose: string;
}

interface FormErrors {
  expenseDate?: string;
  invoiceNumber?: string;
  vendorName?: string;
  amount?: string;
  natureOfExpense?: string;
  purpose?: string;
  attachments?: string;
  submit?: string;
}

export interface ExpenseSubmissionFormProps {
  /** Optional expense ID for editing existing expense */
  expenseId?: string;
  /** Callback when expense is successfully created */
  onSuccess?: (expenseId: string) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ExpenseSubmissionForm({
  expenseId,
  onSuccess,
  onCancel,
}: ExpenseSubmissionFormProps) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    expenseDate: new Date().toISOString().split('T')[0] ?? '', // Today's date
    invoiceNumber: '',
    vendorName: '',
    amount: '',
    natureOfExpense: '',
    purpose: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingExpense, setIsLoadingExpense] = useState(!!expenseId);

  // GL Codes (Nature of Expense options)
  const [glCodes, setGlCodes] = useState<NatureOfExpenseOption[]>([]);
  const [isLoadingGlCodes, setIsLoadingGlCodes] = useState(true);

  // File upload state
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [draftExpenseId, setDraftExpenseId] = useState<string | null>(expenseId || null);
  const [expenseStatus, setExpenseStatus] = useState<
    'draft' | 'rejected' | 'submitted' | 'approved' | null
  >(null);
  const [existingAttachments, setExistingAttachments] = useState<
    Array<{ id: string; fileName: string; contentType: string; fileSize: number; uploadedAt: Date }>
  >([]);
  // Track uploaded file names to prevent duplicate uploads
  const uploadedFileNamesRef = useRef<Set<string>>(new Set());

  // File upload hook (only initialized after draft is created)
  const fileUpload = useFileUpload({
    expenseId: draftExpenseId || '',
    onUploadComplete: (uploadedFile) => {
      // Track uploaded file name
      uploadedFileNamesRef.current.add(uploadedFile.fileName);
    },
    onUploadError: (_file, error) => {
      setErrors((prev) => ({ ...prev, attachments: error }));
    },
  });

  // Load existing expense data if editing
  useEffect(() => {
    async function loadExpense() {
      if (!expenseId) return;

      try {
        setIsLoadingExpense(true);
        const response = await fetch(`/api/expenses/${expenseId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const expense = result.data;
          setFormData({
            expenseDate: expense.expenseDate,
            invoiceNumber: expense.invoiceNumber || '',
            vendorName: expense.vendorName,
            amount: expense.amount,
            natureOfExpense: expense.glCodeId || '',
            purpose: expense.purpose || '',
          });
          setDraftExpenseId(expenseId);
          setExpenseStatus(expense.status);
          // Load existing attachments
          if (expense.attachments && expense.attachments.length > 0) {
            setExistingAttachments(expense.attachments);
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: result.error?.message || 'Failed to load expense',
          }));
        }
      } catch (error) {
        console.error('Error loading expense:', error);
        setErrors((prev) => ({
          ...prev,
          submit: 'Failed to load expense',
        }));
      } finally {
        setIsLoadingExpense(false);
      }
    }

    loadExpense();
  }, [expenseId]);

  // Load GL codes on mount
  useEffect(() => {
    async function loadGlCodes() {
      try {
        const response = await fetch('/api/gl-codes');
        const result = await response.json();

        if (result.success && result.data) {
          setGlCodes(toNatureOfExpenseOptions(result.data));
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: 'Failed to load nature of expense options',
          }));
        }
      } catch (error) {
        console.error('Error loading GL codes:', error);
        setErrors((prev) => ({
          ...prev,
          submit: 'Failed to load nature of expense options',
        }));
      } finally {
        setIsLoadingGlCodes(false);
      }
    }

    loadGlCodes();
  }, []);

  // Handle form field changes
  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear error for this field
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    []
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    } else if (formData.vendorName.length > 255) {
      newErrors.vendorName = 'Vendor name must be less than 255 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be positive';
      } else if (amount > 999999999.99) {
        newErrors.amount = 'Amount exceeds maximum';
      }
    }

    if (!formData.natureOfExpense) {
      newErrors.natureOfExpense = 'Nature of expense is required';
    }

    if (formData.invoiceNumber && formData.invoiceNumber.length > 100) {
      newErrors.invoiceNumber = 'Invoice number must be less than 100 characters';
    }

    if (formData.purpose && formData.purpose.length > 5000) {
      newErrors.purpose = 'Purpose must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Create or update draft expense
  const saveDraft = useCallback(async (): Promise<string | null> => {
    try {
      const expenseData: Record<string, unknown> = {
        workflowType: 'petty' as const,
        expenseDate: formData.expenseDate,
        vendorName: formData.vendorName,
        amount: parseFloat(formData.amount) || 0,
      };

      // Only include optional fields if they have non-empty values
      if (formData.invoiceNumber && formData.invoiceNumber.trim()) {
        expenseData.invoiceNumber = formData.invoiceNumber;
      }
      if (formData.natureOfExpense && formData.natureOfExpense.trim()) {
        expenseData.natureOfExpense = formData.natureOfExpense;
      }
      if (formData.purpose && formData.purpose.trim()) {
        expenseData.purpose = formData.purpose;
      }

      if (draftExpenseId) {
        // Update existing draft
        const response = await fetch(`/api/expenses/${draftExpenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to update draft');
        }
        return draftExpenseId;
      } else {
        // Create new draft
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        const result = await response.json();
        if (!result.success || !result.data?.expenseId) {
          throw new Error(result.error?.message || 'Failed to create draft');
        }
        setDraftExpenseId(result.data.expenseId);
        return result.data.expenseId;
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      return null;
    }
  }, [formData, draftExpenseId]);

  // Handle save as draft
  const handleSaveDraft = async () => {
    // Basic validation for draft
    if (!formData.vendorName.trim()) {
      setErrors({ vendorName: 'Vendor name is required to save draft' });
      return;
    }

    setIsSavingDraft(true);
    setErrors({});

    try {
      const expenseId = await saveDraft();
      if (expenseId) {
        // Show success message and redirect
        router.push(`/expenses?draftSaved=true`);
      } else {
        setErrors({ submit: 'Failed to save draft. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ submit: 'An error occurred while saving draft' });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle file upload
  const handleFilesChange = useCallback(async (newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
    setErrors((prev) => ({ ...prev, attachments: undefined }));
  }, []);

  // Handle deletion of existing attachment
  const handleDeleteExistingAttachment = useCallback(async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete attachment');
      }

      // Remove from existing attachments list
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setErrors((prev) => ({
        ...prev,
        attachments: error instanceof Error ? error.message : 'Failed to delete attachment',
      }));
    }
  }, []);

  // Upload files when draft is created/updated
  useEffect(() => {
    if (!draftExpenseId || files.length === 0) {
      return;
    }

    // Filter out files that have already been uploaded (check both ref and uploadedFiles)
    const newFiles = files.filter((f) => {
      const alreadyUploaded =
        uploadedFileNamesRef.current.has(f.name) ||
        fileUpload.uploadedFiles.some((uf) => uf.fileName === f.name);
      return !alreadyUploaded;
    });

    if (newFiles.length > 0) {
      // Mark files as being uploaded immediately to prevent duplicate calls
      newFiles.forEach((f) => uploadedFileNamesRef.current.add(f.name));
      fileUpload.uploadFiles(newFiles);
    }
  }, [draftExpenseId, files, fileUpload.uploadedFiles, fileUpload.uploadFiles]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Step 1: Save/update draft
      const expenseId = await saveDraft();
      if (!expenseId) {
        throw new Error('Failed to save expense');
      }

      // Step 2: Wait for file uploads to complete (if any)
      if (files.length > 0 && fileUpload.isUploading) {
        // Wait for uploads to complete
        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (!fileUpload.isUploading) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }

      // Step 3: Submit or resubmit expense based on status
      let submitResponse: Response;
      if (expenseStatus === 'rejected') {
        // Resubmit rejected expense
        submitResponse = await fetch(`/api/expenses/${expenseId}/resubmit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Submit draft expense
        submitResponse = await fetch(`/api/expenses/${expenseId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const submitResult = await submitResponse.json();
      if (!submitResult.success) {
        throw new Error(submitResult.error?.message || 'Failed to submit expense');
      }

      // Success! Redirect to expenses list
      onSuccess?.(expenseId);
      router.push(`/expenses?submitted=true`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/expenses');
    }
  };

  // Show loading state when loading expense data
  if (isLoadingExpense) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.submit && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">Error:</span> {errors.submit}
          </p>
        </div>
      )}

      {/* Expense Details Section */}
      <FormSection
        title="Expense Details"
        description="Enter the basic information about your expense"
      >
        <FormRow cols={2}>
          <FormField>
            <DateInput
              label="Expense Date"
              value={formData.expenseDate}
              onChange={handleChange('expenseDate')}
              error={errors.expenseDate}
              isRequired
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
          </FormField>

          <FormField>
            <Input
              label="Invoice Number"
              value={formData.invoiceNumber}
              onChange={handleChange('invoiceNumber')}
              error={errors.invoiceNumber}
              placeholder="Enter invoice number (optional)"
              maxLength={100}
            />
          </FormField>
        </FormRow>

        <FormRow cols={1}>
          <FormField>
            <Input
              label="Vendor Name"
              value={formData.vendorName}
              onChange={handleChange('vendorName')}
              error={errors.vendorName}
              placeholder="Enter vendor name"
              isRequired
              maxLength={255}
            />
          </FormField>
        </FormRow>

        <FormRow cols={2}>
          <FormField>
            <CurrencyInput
              label="Amount"
              value={formData.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              isRequired
            />
          </FormField>

          <FormField>
            <NatureOfExpenseSelect
              label="Nature of Expense"
              options={glCodes}
              value={formData.natureOfExpense}
              onChange={handleChange('natureOfExpense')}
              error={errors.natureOfExpense}
              isRequired
              isLoading={isLoadingGlCodes}
            />
          </FormField>
        </FormRow>
      </FormSection>

      {/* Purpose Section */}
      <FormSection title="Purpose" description="Describe the business purpose of this expense">
        <FormRow cols={1}>
          <FormField>
            <Textarea
              label="Purpose / Description"
              value={formData.purpose}
              onChange={handleChange('purpose')}
              error={errors.purpose}
              placeholder="Describe the business purpose of this expense..."
              maxLength={5000}
              showCount
              rows={4}
            />
          </FormField>
        </FormRow>
      </FormSection>

      {/* Attachments Section */}
      <FormSection
        title="Attachments"
        description="Upload receipts, invoices, or supporting documents"
      >
        <FormRow cols={1}>
          <FormField>
            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Existing Attachments
                </label>
                <ul className="space-y-2">
                  {existingAttachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
                    >
                      {/* File Icon */}
                      <span className="w-10 h-10 flex items-center justify-center text-xl">
                        {getFileIcon(attachment.contentType)}
                      </span>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatFileSize(attachment.fileSize)} • Uploaded{' '}
                          {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingAttachment(attachment.id)}
                        disabled={isSubmitting || isSavingDraft}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete ${attachment.fileName}`}
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* File Upload Zone */}
            <FileUploadZone
              files={files}
              onFilesChange={handleFilesChange}
              error={errors.attachments}
              disabled={isSubmitting || isSavingDraft}
            />
            {fileUpload.isUploading && (
              <div className="mt-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Uploading files... {Math.round(fileUpload.totalProgress)}%
                </p>
                <div className="mt-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-600 dark:bg-zinc-400 transition-all duration-300"
                    style={{ width: `${fileUpload.totalProgress}%` }}
                  />
                </div>
              </div>
            )}
          </FormField>
        </FormRow>
      </FormSection>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSubmitting || isSavingDraft}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={isSubmitting || isSavingDraft || isLoadingGlCodes}
          isLoading={isSavingDraft}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isSavingDraft || isLoadingGlCodes || fileUpload.isUploading}
          isLoading={isSubmitting}
        >
          Submit for Approval
        </Button>
      </div>
    </form>
  );
}
