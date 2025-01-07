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
import { trpc } from "@/util";

type MerchantFormData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
  balance: number;
};

type UpdateMerchantModalProps = {
  merchantId: string;
};

const UpdateMerchantModal = ({ merchantId }: UpdateMerchantModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isError, isLoading } = trpc.getMerchants.useQuery();
  const merchant = data?.merchants.find(
    (merchant) => merchant.merchantId === merchantId
  );
  const mutation = trpc.updateMerchant.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (merchant === undefined || isError) {
    return null;
  }

  const initialFormState = {
    merchantId: merchant.merchantId,
    name: merchant.name,
    phoneNumber: merchant.phoneNumber,
    location: merchant.location,
    balance: merchant.balance,
  };

  const [formData, setFormData] = useState<MerchantFormData>(initialFormState);

  useEffect(() => {
    if (isModalOpen) {
      setFormData(initialFormState); // Reset form data when the modal opens
    }
  }, [isModalOpen]);

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
    mutation.mutate(formData);

    setFormData({
      merchantId: "",
      name: "",
      phoneNumber: "",
      location: "",
      balance: 0,
    });
  };

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingTop: "0.5rem",
      }}
    >
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Merchant Details</DialogTitle>
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
                onClick={() => setIsModalOpen(false)}
                variant="outlined"
                color="secondary"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success">
                Update
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="contained"
        color="success"
        style={{ fontSize: "0.65rem" }}
      >
        Update Merchant
      </Button>
    </div>
  );
};

export default UpdateMerchantModal;
