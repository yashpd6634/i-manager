import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

type ProductFormData = {
  productId: string;
  name: string;
  wholesalePrice: string;
  retailPrice: string;
  purchasedQuantity: number;
  expiryDate: Date;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    productId: v4(),
    name: "",
    wholesalePrice: "",
    retailPrice: "",
    purchasedQuantity: 0,
    expiryDate: new Date(),
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "expiryDate"
          ? new Date(value) // Convert date string to Date object for expiryDate
          : name === "wholesalePrice" || name === "retailPrice"
          ? value // Keep as a string to allow decimal typing
          : name === "purchasedQuantity"
          ? value
            ? parseInt(value)
            : 0 // Ensure purchasedQuantity is always a number
          : value,
    }));
  };

  const formattedExpiryDate = formData.expiryDate
    ? formData.expiryDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Product</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* PRODUCT NAME */}
          <TextField
            label="Product Name"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            fullWidth
            required
            margin="normal"
          />

          {/* WHOLESALE PRICE */}
          <TextField
            label="Wholesale Price"
            name="wholesalePrice"
            placeholder="Wholesale Price"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.wholesalePrice || ""}
            fullWidth
            required
            margin="normal"
          />

          {/* RETAIL PRICE */}
          <TextField
            label="Retail Price"
            name="retailPrice"
            placeholder="Retail Price"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.retailPrice || ""}
            fullWidth
            required
            margin="normal"
          />

          {/* PURCHASED QUANTITY */}
          <TextField
            label="Purchased Quantity"
            name="purchasedQuantity"
            placeholder="Purchased Quantity"
            onChange={handleChange}
            value={formData.purchasedQuantity}
            fullWidth
            required
            margin="normal"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />

          {/* EXPIRY DATE */}
          <TextField
            label="Expiry Date"
            type="date"
            name="expiryDate"
            onChange={handleChange}
            value={formattedExpiryDate}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
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
              Create
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;
