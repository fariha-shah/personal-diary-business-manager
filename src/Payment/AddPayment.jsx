import React, {useRef, useState } from 'react';
import { usePayments } from './hooks/usePayments';
import {
  Calendar,
  Info,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';


const EMPTY_FORM = {
  relatedTo: '',
  property: '',
  client: '',
  invoiceRef: '',
  paymentDate: '',
  amountReceived: '',
  paymentMethod: '',
  transactionRef: '',
  bankAccount: '',
  notes: '',
  receiptFile: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPKR(value) {
  const number = Number(value) || 0;
  return `PKR ${number.toLocaleString('en-PK')}`;
}



// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

const STEPS = [
  { number: 1, label: 'Payment Information' },
  { number: 2, label: 'Payment Details' },
  { number: 3, label: 'Review' },
  { number: 4, label: 'Confirmation' },
];

function Stepper({ step }) {
  return (
    <div className="mb-8 flex items-center overflow-x-auto rounded-2xl bg-white px-6 py-5 shadow-sm">
      {STEPS.map((item, index) => (
        <React.Fragment key={item.number}>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                item.number === step
                  ? 'bg-blue-600 text-white'
                  : item.number < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {item.number < step ? '✓' : item.number}
            </div>

            <span
              className={`whitespace-nowrap text-sm ${
                item.number === step
                  ? 'font-medium text-slate-900'
                  : item.number < step
                    ? 'text-slate-600'
                    : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </div>

          {index < STEPS.length - 1 && (
            <div
              className={`mx-4 h-px min-w-8 flex-1 ${
                item.number < step ? 'bg-emerald-400' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable Field
// ---------------------------------------------------------------------------

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {children}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const baseFieldClass =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100';

function fieldBorder(error) {
  return error
    ? 'border-red-300 focus:border-red-400'
    : 'border-slate-200 focus:border-blue-400';
}

// ---------------------------------------------------------------------------
// Text Field
// ---------------------------------------------------------------------------

function TextField({
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
}) {
  return (
    <Field label={label} required={required} error={error}>
      <input
        type={type}
        className={`${baseFieldClass} ${fieldBorder(error)}`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Saved Payments
// ---------------------------------------------------------------------------

function SavedPayments({ payments, onDelete }) {
  if (payments.length === 0) {
    return (
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Saved Payments
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your saved payment records will appear here.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
          <FileText size={28} className="mx-auto text-slate-300" />

          <p className="mt-2 text-sm text-slate-400">
            No saved payments found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Saved Payments
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {payments.length} payment
            {payments.length !== 1 ? 's' : ''} saved .
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-6 py-3 font-medium">Related To</th>

              <th className="px-6 py-3 font-medium">Property</th>

              <th className="px-6 py-3 font-medium">Client</th>

              <th className="px-6 py-3 font-medium">Amount</th>

              <th className="px-6 py-3 font-medium">Payment Method</th>

              <th className="px-6 py-3 font-medium">Payment Date</th>

              <th className="px-6 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-6 py-4 font-medium text-slate-700">
                  {payment.relatedTo || '-'}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {payment.property || '-'}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {payment.client || '-'}
                </td>

                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                  {formatPKR(payment.amountReceived)}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {payment.paymentMethod || '-'}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                  {payment.paymentDate || '-'}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(payment.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    title="Delete payment"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Summary Panel
// ---------------------------------------------------------------------------

function SummaryPanel({ amountReceived, savedPayments }) {
  const currentAmount = Number(amountReceived) || 0;

  const totalSaved = savedPayments.reduce(
    (total, payment) => total + (Number(payment.amountReceived) || 0),
    0
  );

  const totalAfterCurrentPayment = totalSaved + currentAmount;

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Payment Summary
        </h2>

        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Saved Payments</span>

            <span className="font-medium text-slate-700">
              {savedPayments.length}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total Saved Amount</span>

            <span className="font-medium text-slate-700">
              {formatPKR(totalSaved)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">This Payment</span>

            <span className="font-medium text-slate-700">
              {formatPKR(currentAmount)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <span className="font-medium text-blue-600">Total After Payment</span>

          <span className="font-semibold text-blue-600">
            {formatPKR(totalAfterCurrentPayment)}
          </span>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Quick Stats
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </span>

            <div>
              <p className="text-xs text-slate-400">Saved</p>

              <p className="text-sm font-semibold text-slate-800">
                {formatPKR(totalSaved)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              +
            </span>

            <div>
              <p className="text-xs text-slate-400">Current</p>

              <p className="text-sm font-semibold text-slate-800">
                {formatPKR(currentAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Step 1
// ---------------------------------------------------------------------------

function StepPaymentInformation({ form, setField, errors }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        Payment Information
      </h2>

      <div className="flex flex-col gap-5">
        <TextField
          label="Related To"
          required
          placeholder="e.g. Property, Client, Deal"
          value={form.relatedTo}
          onChange={(value) => setField('relatedTo', value)}
          error={errors.relatedTo}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Property"
            placeholder="Enter property name"
            value={form.property}
            onChange={(value) => setField('property', value)}
          />

          <TextField
            label="Client"
            placeholder="Enter client name"
            value={form.client}
            onChange={(value) => setField('client', value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Invoice / Ref #"
            placeholder="e.g. INV-00045"
            value={form.invoiceRef}
            onChange={(value) => setField('invoiceRef', value)}
          />

          <Field label="Payment Date" required error={errors.paymentDate}>
            <div className="relative">
              <input
                type="date"
                className={`${baseFieldClass} ${fieldBorder(
                  errors.paymentDate
                )} pr-10`}
                value={form.paymentDate}
                onChange={(event) =>
                  setField('paymentDate', event.target.value)
                }
              />

              <Calendar
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">
          <Info size={16} className="mt-0.5 shrink-0" />

          <p>
            Enter the payment information manually. Your payment will be saved.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Step 2
// ---------------------------------------------------------------------------

function StepPaymentDetails({ form, setField, errors }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    if (!files || !files[0]) {
      return;
    }

    const file = files[0];

    const reader = new FileReader();

    reader.onload = () => {
      setField('receiptFile', {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        Payment Details
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Amount Received" required error={errors.amountReceived}>
          <div
            className={`flex overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldBorder(
              errors.amountReceived
            )}`}
          >
            <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-400">
              PKR
            </span>

            <input
              type="number"
              min="0"
              className="w-full px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              placeholder="Enter amount"
              value={form.amountReceived}
              onChange={(event) =>
                setField('amountReceived', event.target.value)
              }
            />
          </div>
        </Field>

        <TextField
          label="Payment Method"
          required
          placeholder="e.g. Bank Transfer, Cash"
          value={form.paymentMethod}
          onChange={(value) => setField('paymentMethod', value)}
          error={errors.paymentMethod}
        />

        <TextField
          label="Transaction / Cheque #"
          placeholder="e.g. TRX123456"
          value={form.transactionRef}
          onChange={(value) => setField('transactionRef', value)}
        />

        <TextField
          label="Bank / Account"
          placeholder="Enter bank or account name"
          value={form.bankAccount}
          onChange={(value) => setField('bankAccount', value)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field label="Notes (Optional)">
          <textarea
            rows={4}
            className={`${baseFieldClass} ${fieldBorder()} resize-none`}
            placeholder="Add any notes about this payment..."
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
          />
        </Field>

        <Field label="Upload Receipt (Optional)">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />

          {form.receiptFile ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <FileText size={22} className="text-blue-600" />

              <p className="max-w-full truncate text-sm text-slate-700">
                {form.receiptFile.name}
              </p>

              <button
                type="button"
                onClick={() => setField('receiptFile', null)}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
              >
                <X size={12} />
                Remove file
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFiles(event.dataTransfer.files);
              }}
              className={`flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300 bg-slate-50'
              }`}
            >
              <UploadCloud size={22} className="text-slate-400" />

              <p className="text-sm text-slate-500">
                Drag & drop a file here or{' '}
                <span className="font-medium text-blue-600">Choose File</span>
              </p>

              <p className="text-xs text-slate-400">JPG, PNG, PDF</p>
            </div>
          )}
        </Field>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>

      <span className="max-w-[60%] break-words text-right font-medium text-slate-700">
        {value || '—'}
      </span>
    </div>
  );
}

function StepReview({ form }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        Review Payment
      </h2>

      <div className="mb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Payment Information
        </p>

        <ReviewRow label="Related To" value={form.relatedTo} />

        <ReviewRow label="Property" value={form.property} />

        <ReviewRow label="Client" value={form.client} />

        <ReviewRow label="Invoice / Ref #" value={form.invoiceRef} />

        <ReviewRow label="Payment Date" value={form.paymentDate} />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Payment Details
        </p>

        <ReviewRow
          label="Amount Received"
          value={
            form.amountReceived ? formatPKR(Number(form.amountReceived)) : ''
          }
        />

        <ReviewRow label="Payment Method" value={form.paymentMethod} />

        <ReviewRow label="Transaction / Cheque #" value={form.transactionRef} />

        <ReviewRow label="Bank / Account" value={form.bankAccount} />

        <ReviewRow label="Notes" value={form.notes} />

        <ReviewRow
          label="Receipt"
          value={form.receiptFile ? form.receiptFile.name : ''}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Confirmation
// ---------------------------------------------------------------------------

function StepConfirmation({ form, onAddAnother }) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-10 text-center shadow-sm lg:col-span-2">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={30} />
      </span>

      <h2 className="text-lg font-semibold text-slate-900">
        Payment Recorded Successfully
      </h2>

      <p className="max-w-sm text-sm text-slate-500">
        {formatPKR(Number(form.amountReceived) || 0)} has been saved successfully.
        {form.client ? ` for ${form.client}` : ''}
        {form.paymentDate ? ` on ${form.paymentDate}` : ''}.
      </p>

      <button
        onClick={onAddAnother}
        className="mt-2 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus size={16} />
        Add Another Payment
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

function AddPaymentContent() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  

  const { payments: savedPayments, addPayment, deletePaymentById } =
  usePayments();

  // -------------------------------------------------------------------------
  // Field update
  // -------------------------------------------------------------------------

  const setField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((previous) => ({
        ...previous,
        [key]: undefined,
      }));
    }
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validateStep1 = () => {
    const nextErrors = {};

    if (!form.relatedTo.trim()) {
      nextErrors.relatedTo = 'Please enter what this payment relates to.';
    }

    if (!form.paymentDate) {
      nextErrors.paymentDate = 'Please choose a payment date.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = () => {
    const nextErrors = {};

    if (!form.amountReceived || Number(form.amountReceived) <= 0) {
      nextErrors.amountReceived = 'Please enter a valid amount.';
    }

    if (!form.paymentMethod.trim()) {
      nextErrors.paymentMethod = 'Please enter a payment method.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // -------------------------------------------------------------------------
  // Save Payment
  // -------------------------------------------------------------------------

  const saveCurrentPayment = async () => {
  const newPayment = {
    ...form,
    amountReceived: Number(form.amountReceived) || 0,
  };

  try {
    await addPayment(newPayment);
    return true;
  } catch (error) {
    console.error(error);
    alert('Payment could not be saved.');
    return false;
  }
};


    
  // -------------------------------------------------------------------------
  // Delete Payment
  // -------------------------------------------------------------------------

  const deletePayment = async (paymentId) => {
  const payment = savedPayments.find((item) => item.id === paymentId);

  if (!payment) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete this payment of ${formatPKR(
      payment.amountReceived
    )}?`
  );

  if (!confirmed) return;

  try {
    await deletePaymentById(paymentId);
  } catch (error) {
    console.error(error);
    alert('Payment could not be deleted.');
  }
};

  

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
const nextStep = async () => {
  if (step === 1 && !validateStep1()) {
    return;
  }

  if (step === 2 && !validateStep2()) {
    return;
  }

  if (step === 3) {
    const saved = await saveCurrentPayment();

    if (!saved) {
      return;
    }
  }

  if (step < 4) {
    setStep((previous) => previous + 1);
  }
};
  
  const previousStep = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  const addAnother = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setErrors({});
    setStep(1);
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Payment</h1>

        <p className="mt-1 text-sm text-slate-400">
          Home <span className="mx-1">›</span>
          Payments <span className="mx-1">›</span>
          Add Payment
        </p>
      </div>

      {/* Stepper */}

      <Stepper step={step} />

      {/* Main Form */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {step === 1 && (
          <StepPaymentInformation
            form={form}
            setField={setField}
            errors={errors}
          />
        )}

        {step === 2 && (
          <StepPaymentDetails form={form} setField={setField} errors={errors} />
        )}

        {step === 3 && <StepReview form={form} />}

        {step === 4 && (
          <StepConfirmation form={form} onAddAnother={addAnother} />
        )}

        {step !== 4 && (
          <SummaryPanel
            amountReceived={form.amountReceived}
            savedPayments={savedPayments}
          />
        )}
      </div>

      {/* Footer Actions */}

      {step !== 4 && (
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={previousStep}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={addAnother}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {step === 3 ? 'Confirm & Submit' : 'Next Step'}

            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Saved Payments */}

      <SavedPayments payments={savedPayments} onDelete={deletePayment} />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AddPayment() {
  return <AddPaymentContent />;
}
