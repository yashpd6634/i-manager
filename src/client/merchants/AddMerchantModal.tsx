import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
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

type MerchantFormData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
  balance: number;
};

type CreateMerchantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: MerchantFormData) => void;
};

const CreateMerchantModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateMerchantModalProps) => {
  const initialFormState = {
    merchantId: v4(),
    name: "",
    phoneNumber: "",
    location: "",
    balance: 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState); // Reset form data when the modal opens
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value)
          : value,
    });
  };

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
      <DialogTitle>Create New Merchant</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* MERCHANT NAME */}
          <TextField
            label="Merchant Name"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            fullWidth
            required
            margin="normal"
          />

          {/* PHONE NUMBER */}
          <TextField
            label="Phone Number"
            name="phoneNumber"
            placeholder="Phone Number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={handleChange}
            value={formData.phoneNumber}
            fullWidth
            required
            margin="normal"
          />

          {/* LOCATION */}
          <TextField
            label="Location"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={formData.location}
            fullWidth
            required
            margin="normal"
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

export default CreateMerchantModal;
