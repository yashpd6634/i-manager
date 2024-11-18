import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { v4 } from "uuid";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { trpc } from "@/util";

type ProductFormData = {
  productId: string;
  name: string;
  piecesPerQuantity: number;
  wholesalePrice: string;
  retailPrice: string;
  purchasedQuantity: number;
  expiryDate: Date;
};

type UpdateProductModalProps = {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (formData: ProductFormData) => void;
};

const UpdateProductModal = ({
  productId,
  isOpen,
  onClose,
  onUpdate,
}: UpdateProductModalProps) => {
  const {
    data: productData,
    isLoading,
    isError,
  } = trpc.getProduct.useQuery({ productId });

  const [formData, setFormData] = useState<ProductFormData | null>(null);

  useEffect(() => {
    if (productData) {
      setFormData({
        productId: productId,
        name: productData.name,
        piecesPerQuantity: productData.piecesPerQuantity,
        wholesalePrice: String(productData.wholesalePrice),
        retailPrice: String(productData.retailPrice),
        purchasedQuantity: productData.purchasedQuantity,
        expiryDate: new Date(productData.expiryDate),
      });
    }
  }, [productData, productId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) =>
      prevData
        ? {
            ...prevData,
            [name]:
              name === "expiryDate"
                ? new Date(value) // Convert date string to Date object for expiryDate
                : name === "wholesalePrice" || name === "retailPrice"
                ? value // Keep as a string to allow decimal typing
                : name === "purchasedQuantity" || name === "piecesPerQuantity"
                ? parseInt(value) || 0 // Ensure purchasedQuantity and piecesPerQuantity is always a number
                : value,
          }
        : null
    );
  };

  const formattedExpiryDate = formData?.expiryDate
    ? formData.expiryDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData) {
      onUpdate(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Product</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* PRODUCT NAME */}
          <TextField
            label="Product Name"
            name="name"
            onChange={handleChange}
            value={formData?.name}
            fullWidth
            required
            disabled
            margin="normal"
          />

          {/* WHOLESALE PRICE */}
          <TextField
            label="Wholesale Price"
            name="wholesalePrice"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData?.wholesalePrice || ""}
            fullWidth
            required
            margin="normal"
          />

          {/* RETAIL PRICE */}
          <TextField
            label="Retail Price"
            name="retailPrice"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData?.retailPrice || ""}
            fullWidth
            required
            margin="normal"
          />

          {/* Pieces per quantity */}
          <TextField
            label="Pieces per quantity"
            name="piecesPerQuantity"
            onChange={handleChange}
            value={formData?.piecesPerQuantity}
            fullWidth
            required
            margin="normal"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />

          {/* PURCHASED QUANTITY */}
          <TextField
            label="Purchased Quantity"
            name="purchasedQuantity"
            onChange={handleChange}
            value={formData?.purchasedQuantity}
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

export default UpdateProductModal;
