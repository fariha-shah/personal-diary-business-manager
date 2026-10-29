import { useState } from 'react';
import {
  FiPlus,
  FiDollarSign,
  FiUsers,
  FiTrash2,
  FiEdit2,
  FiImage,
} from 'react-icons/fi';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Tabs from '../components/common/Tabs';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';

import SummaryCards from './components/SummaryCards';
import NetBalanceChart from './components/NetBalanceChart';
import HistoryFilter from './components/HistoryFilter';
import ExpenseForm from './components/ExpenseForm';
import LoanForm from './components/LoanForm';
import ExpenseCharts from './components/ExpenseCharts';
import LoanChart from './components/LoanChart';

import { useExpenses } from './hooks/useExpenses';
import { useLoan } from './hooks/useLoan';

import { exportExpensesPdf, exportLoansPdf } from './utils/pdfExport';

export default function PersonalExpenses() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchDate, setSearchDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading: expensesLoading,
  } = useExpenses();

  const {
    loanRecords,
    addLoan,
    updateLoan,
    deleteLoan,
    toggleStatus,
    isLoading: loanLoading,
  } = useLoan();

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const totalGiven = loanRecords
    .filter((record) => record.type === 'Given')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const totalTaken = loanRecords
    .filter((record) => record.type === 'Taken')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const pendingGiven = loanRecords
    .filter((record) => record.type === 'Given' && record.status === 'Pending')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const pendingTaken = loanRecords
    .filter((record) => record.type === 'Taken' && record.status === 'Pending')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const netLoan = pendingGiven - pendingTaken;

  const query = searchQuery.trim().toLowerCase();

  const filteredExpenses = expenses
    .filter((expense) => !searchDate || expense.date === searchDate)
    .filter((expense) => {
      if (!query) return true;
      const haystack = [
        expense.category,
        expense.paymentMethod,
        expense.description,
        String(expense.amount),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

  const filteredLoans = loanRecords
    .filter((record) => !searchDate || record.date === searchDate)
    .filter((record) => {
      if (!query) return true;
      const haystack = [
        record.name,
        record.type,
        record.status,
        record.description,
        String(record.amount),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

  const handleAddClick = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (row) => {
    setActiveTab('expenses');
    setEditTarget({ type: 'expense', data: row });
    setIsModalOpen(true);
  };

  const handleEditLoan = (row) => {
    setActiveTab('loan');
    setEditTarget({ type: 'loan', data: row });
    setIsModalOpen(true);
  };

  const handleExpenseSubmit = (data) => {
    if (editTarget?.type === 'expense') {
      updateExpense(editTarget.data.id, data);
    } else {
      addExpense(data);
    }
    setEditTarget(null);
    setIsModalOpen(false);
  };

  const handleLoanSubmit = (data) => {
    if (editTarget?.type === 'loan') {
      updateLoan(editTarget.data.id, data);
    } else {
      addLoan(data);
    }
    setEditTarget(null);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'expense') {
      deleteExpense(deleteTarget.id);
    } else {
      deleteLoan(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleExportPdf = () => {
    if (activeTab === 'expenses') {
      const filteredTotal = filteredExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );
      exportExpensesPdf(filteredExpenses, filteredTotal, searchDate);
    } else {
      const givenInView = filteredLoans
        .filter((record) => record.type === 'Given')
        .reduce((sum, record) => sum + Number(record.amount), 0);
      const takenInView = filteredLoans
        .filter((record) => record.type === 'Taken')
        .reduce((sum, record) => sum + Number(record.amount), 0);
      exportLoansPdf(filteredLoans, givenInView, takenInView, searchDate);
    }
  };

  const renderProof = (row) => {
    if (!row.proof) {
      return <span className="text-gray-400">—</span>;
    }
    return (
      <button
        type="button"
        onClick={() =>
          setProofPreview({
            src: row.proof,
            name: row.proofName || 'Payment Proof',
          })
        }
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-400 transition-colors"
        title="View proof"
      >
        <FiImage size={15} />
        <span>View Proof</span>
      </button>
    );
  };

  const loanColumns = [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (row) => row.description || '—',
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge tone={row.type === 'Given' ? 'orange' : 'purple'}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `PKR ${Number(row.amount).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button onClick={() => toggleStatus(row.id)} title="Click to toggle">
          <Badge tone={row.status === 'Paid' ? 'green' : 'orange'}>
            {row.status}
          </Badge>
        </button>
      ),
    },
    { key: 'proof', label: 'Proof', render: renderProof },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEditLoan(row)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit loan"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              setDeleteTarget({ type: 'loan', id: row.id, label: row.name })
            }
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete loan"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const expenseColumns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (row) => (
        <Badge tone={row.paymentMethod === 'Cash' ? 'green' : 'blue'}>
          {row.paymentMethod}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `PKR ${Number(row.amount).toLocaleString()}`,
    },
    { key: 'proof', label: 'Proof', render: renderProof },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEditExpense(row)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit expense"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              setDeleteTarget({
                type: 'expense',
                id: row.id,
                label: row.description,
              })
            }
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete expense"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    // -m-6 cancels MainLayout's p-6 padding and px-8 py-6 re-adds it here —
    // same trick Notes.jsx uses so this page gets its own full-bleed
    // light background instead of the dark shell showing through.
    <div className="-m-3 sm:-m-5 md:-m-6 min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Personal Expenses
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your daily spending and manage loan records.
          </p>
        </div>

        <Button icon={FiPlus} onClick={handleAddClick}>
          {activeTab === 'expenses' ? 'Add Expense' : 'Add Loan'}
        </Button>
      </div>

      <SummaryCards
        totalSpent={totalSpent}
        totalGiven={totalGiven}
        totalTaken={totalTaken}
        netLoan={netLoan}
      />

      <NetBalanceChart expenses={expenses} loanRecords={loanRecords} />

      <Card padding="p-0" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-gray-100">
          <Tabs
            tabs={[
              {
                label: 'Expenses',
                value: 'expenses',
                icon: FiDollarSign,
                count: expenses.length,
              },
              {
                label: 'Loan',
                value: 'loan',
                icon: FiUsers,
                count: loanRecords.length,
              },
            ]}
            active={activeTab}
            onChange={(value) => {
              setActiveTab(value);
              setEditTarget(null);
            }}
          />
        </div>

        <div className="p-5 space-y-5">
          <HistoryFilter
            date={searchDate}
            onDateChange={(e) => setSearchDate(e.target.value)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={
              activeTab === 'expenses'
                ? 'Search by category, payment, or amount...'
                : 'Search by name, purpose, type, or amount...'
            }
            onClear={() => {
              setSearchDate('');
              setSearchQuery('');
            }}
            onExportPdf={handleExportPdf}
          />

          {(searchDate || query) && (
            <p className="text-gray-500 text-sm">
              Showing filtered results
              {searchDate && (
                <>
                  {' '}
                  for{' '}
                  <span className="text-gray-900 font-medium">
                    {searchDate}
                  </span>
                </>
              )}
              {query && (
                <>
                  {' '}
                  matching "
                  <span className="text-gray-900 font-medium">
                    {searchQuery}
                  </span>
                  "
                </>
              )}
            </p>
          )}

          {activeTab === 'expenses' ? (
            <Table
              columns={expenseColumns}
              data={filteredExpenses}
              isLoading={expensesLoading}
              emptyMessage={
                searchDate || query
                  ? 'No expenses match your search'
                  : 'No expenses added yet'
              }
            />
          ) : (
            <Table
              columns={loanColumns}
              data={filteredLoans}
              isLoading={loanLoading}
              emptyMessage={
                searchDate || query
                  ? 'No loan records match your search'
                  : 'No loan records yet'
              }
            />
          )}
        </div>
      </Card>

      {activeTab === 'expenses' ? (
        <ExpenseCharts expenses={expenses} />
      ) : (
        <LoanChart totalGiven={totalGiven} totalTaken={totalTaken} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          activeTab === 'expenses'
            ? editTarget
              ? 'Edit Expense'
              : 'Add Expense'
            : editTarget
              ? 'Edit Loan'
              : 'Add Loan'
        }
      >
        {activeTab === 'expenses' ? (
          <ExpenseForm
            key={editTarget?.type === 'expense' ? editTarget.data.id : 'new-expense'}
            initialData={
              editTarget?.type === 'expense' ? editTarget.data : undefined
            }
            onSubmit={handleExpenseSubmit}
            onCancel={handleModalClose}
          />
        ) : (
          <LoanForm
            key={editTarget?.type === 'loan' ? editTarget.data.id : 'new-loan'}
            initialData={
              editTarget?.type === 'loan' ? editTarget.data : undefined
            }
            onSubmit={handleLoanSubmit}
            onCancel={handleModalClose}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'expense'
            ? 'Delete this expense?'
            : 'Delete this loan record?'
        }
        message={
          deleteTarget?.label
            ? `"${deleteTarget.label}" will be permanently removed.`
            : 'This record will be permanently removed.'
        }
      />

      <Modal
        isOpen={!!proofPreview}
        onClose={() => setProofPreview(null)}
        title={proofPreview?.name || 'Payment Proof'}
        maxWidth="max-w-3xl"
      >
        {proofPreview?.src && (
          <div className="flex justify-center">
            <img
              src={proofPreview.src}
              alt={proofPreview.name || 'Payment Proof'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
