import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";

type ExpenseFormData = {
  expenseId: string;
  category: string;
  amount: string;
  expendDate: Date;
  description: string;
};

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (formData: ExpenseFormData) => void;
};

const AddExpenseModal = ({ isOpen, onClose, onAdd }: AddExpenseModalProps) => {
  const [formData, setFormData] = useState({
    expenseId: v4(),
    category: "",
    amount: "",
    expendDate: new Date(),
    description: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "expendDate"
          ? new Date(value)
          : name === "amount"
          ? value // Allow amount to be a string to support decimal input
          : value,
    }));
  };

  const formattedExpendDate = formData.expendDate
    ? formData.expendDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Add New Expense" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* EXPENSE CATEGORY */}
          <label htmlFor="category" className={labelCssStyles}>
            Category
          </label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            value={formData.category}
            className={inputCssStyles}
            required
          />

          {/* AMOUNT */}
          <label htmlFor="amount" className={labelCssStyles}>
            Amount
          </label>
          <input
            type="text"
            name="amount"
            placeholder="Amount"
            onChange={(e) => {
              const value = e.target.value;
              // Allow only numbers and one decimal point
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.amount || ""}
            className={inputCssStyles}
            required
          />

          {/* EXPEND DATE */}
          <label htmlFor="expendDate" className={labelCssStyles}>
            Expenditure Date
          </label>
          <input
            type="date"
            name="expendDate"
            placeholder="Expenditure Date"
            onChange={handleChange}
            value={formattedExpendDate}
            className={inputCssStyles}
            required
          />

          {/* DESCRIPTION */}
          <label htmlFor="description" className={labelCssStyles}>
            Description
          </label>
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            className={inputCssStyles}
            required
          />

          {/* ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Add Expense
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
