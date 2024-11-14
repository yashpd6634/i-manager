import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";

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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Expense</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* EXPENSE CATEGORY */}
          <TextField
            label="Category"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            value={formData.category}
            fullWidth
            required
            margin="normal"
          />

          {/* AMOUNT */}
          <TextField
            label="Amount"
            name="amount"
            placeholder="Amount"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.amount || ""}
            fullWidth
            required
            margin="normal"
          />

          {/* EXPENDITURE DATE */}
          <TextField
            label="Expenditure Date"
            type="date"
            name="expendDate"
            onChange={handleChange}
            value={formattedExpendDate}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            fullWidth
            required
            margin="normal"
            multiline
            rows={4}
          />

          {/* ACTION BUTTONS */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="secondary"
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Expense
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
