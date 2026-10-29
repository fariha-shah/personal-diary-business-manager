import { useState } from 'react';
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi';

import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import DatePicker from '../../components/common/DatePicker';
import Button from '../../components/common/Button';

import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const getEmptyForm = () => ({
  amount: '',
  category: '',
  description: '',
  paymentMethod: '',
  date: new Date().toISOString().slice(0, 10),
  proof: null,
  proofName: '',
});

export default function ExpenseForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    initialData
      ? {
          amount: initialData.amount ?? '',
          category: initialData.category || '',
          description: initialData.description || '',
          paymentMethod: initialData.paymentMethod || '',
          date: initialData.date || new Date().toISOString().slice(0, 10),
          proof: initialData.proof || null,
          proofName: initialData.proofName || '',
        }
      : getEmptyForm()
  );
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, proof: 'File must be under 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        proof: reader.result,
        proofName: file.name,
      }));
      setErrors((prev) => ({ ...prev, proof: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setField('proof', null);
    setField('proofName', '');
  };

  const validate = () => {
    const next = {};
    if (!form.amount || Number(form.amount) <= 0)
      next.amount = 'Enter a valid amount';
    if (!form.category) next.category = 'Select a category';
    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.paymentMethod) next.paymentMethod = 'Select a payment method';
    if (!form.date) next.date = 'Date is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount (PKR)"
        type="number"
        min="0"
        step="0.01"
        placeholder="e.g. 1500"
        value={form.amount}
        onChange={(e) => setField('amount', e.target.value)}
        error={errors.amount}
      />

      <Dropdown
        label="Category"
        options={EXPENSE_CATEGORIES}
        value={form.category}
        onChange={(value) => setField('category', value)}
        placeholder="Select category"
        error={errors.category}
      />

      <Input
        label="Description"
        placeholder="e.g. Grocery from Metro"
        value={form.description}
        onChange={(e) => setField('description', e.target.value)}
        error={errors.description}
      />

      <Dropdown
        label="Payment Method"
        options={PAYMENT_METHODS}
        value={form.paymentMethod}
        onChange={(value) => setField('paymentMethod', value)}
        placeholder="Select payment method"
        error={errors.paymentMethod}
      />

      <DatePicker
        label="Date"
        value={form.date}
        onChange={(e) => setField('date', e.target.value)}
        error={errors.date}
      />

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          Payment Proof (optional)
        </label>

        {!form.proof ? (
          <label
            className="flex items-center justify-center gap-2 border border-dashed border-gray-200
                       rounded-lg py-4 text-gray-400 text-sm cursor-pointer
                       hover:border-blue-500 hover:text-gray-500 transition-colors"
          >
            <FiUpload size={16} />
            Click to upload image or file
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 text-gray-900 text-sm truncate">
              {form.proof.startsWith('data:image') ? (
                <FiImage size={16} className="text-blue-600 shrink-0" />
              ) : (
                <FiFile size={16} className="text-blue-600 shrink-0" />
              )}
              <span className="truncate">{form.proofName}</span>
            </div>
            <button
              type="button"
              onClick={removeProof}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Remove proof"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {errors.proof && (
          <p className="text-red-500 text-xs mt-1">{errors.proof}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          {isEditing ? 'Update Expense' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}
