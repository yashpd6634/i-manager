import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

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
  const initialFormState = {
    expenseId: v4(),
    category: "",
    amount: "",
    expendDate: new Date(),
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState); // Reset form data when the modal opens
    }
  }, [isOpen]);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
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
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => handleChange(e)}
            label="Category"
            fullWidth
            className="my-2"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Rent">Rent</MenuItem>
            <MenuItem value="StaffPayment">Staff Payment</MenuItem>
            <MenuItem value="ElectricityBill">Electricity Bill</MenuItem>
            <MenuItem value="Transportation">Transportation</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="MaintenanceShop">Maintenance - Shop</MenuItem>
            <MenuItem value="MaintenanceSelf">Maintenance - Self</MenuItem>
            <MenuItem value="Others">Others</MenuItem>
          </Select>

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
              onClick={() => {
                setFormData({
                  expenseId: "",
                  category: "",
                  amount: "",
                  expendDate: new Date(),
                  description: "",
                });
                onClose();
              }}
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
