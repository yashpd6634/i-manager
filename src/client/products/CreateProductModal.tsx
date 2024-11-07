import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Product" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="productName" className={labelCssStyles}>
            Product Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          {/* PRICE */}
          <label htmlFor="wholesalePrice" className={labelCssStyles}>
            Wholesale Price
          </label>
          <input
            type="text" // Change to text to allow decimal input easily
            name="wholesalePrice"
            placeholder="Wholesale Price"
            onChange={(e) => {
              const value = e.target.value;
              // Allow only numbers and one decimal point
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.wholesalePrice || ""} // Ensure it's a string
            className={inputCssStyles}
            required
          />

          <label htmlFor="retailPrice" className={labelCssStyles}>
            Retail Price
          </label>
          <input
            type="text"
            name="retailPrice"
            placeholder="Retail Price"
            onChange={(e) => {
              const value = e.target.value;
              // Allow only numbers and one decimal point
              if (/^\d*\.?\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            value={formData.retailPrice || ""}
            className={inputCssStyles}
            required
          />

          {/* STOCK QUANTITY */}
          <label htmlFor="purchasedQuantity" className={labelCssStyles}>
            Purchased Quantity
          </label>
          <input
            type="number"
            name="purchasedQuantity"
            placeholder="Purchased Quantity"
            onChange={handleChange}
            value={formData.purchasedQuantity}
            className={inputCssStyles}
            required
          />

          {/* EXPIRY DATE */}
          <label htmlFor="expiryDate" className={labelCssStyles}>
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            placeholder="expiryDate"
            onChange={handleChange}
            value={formattedExpiryDate}
            className={inputCssStyles}
            required
          />

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create
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

export default CreateProductModal;
