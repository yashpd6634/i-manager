import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";

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
  const [formData, setFormData] = useState({
    merchantId: v4(),
    name: "",
    phoneNumber: "",
    location: "",
    balance: 0,
  });

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Merchant" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* MERCHANT NAME */}
          <label htmlFor="name" className={labelCssStyles}>
            Merchant Name
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
          <label htmlFor="phoneNumber" className={labelCssStyles}>
            Phone Number
          </label>
          <input
            type="number"
            name="phoneNumber"
            placeholder="Phone Number"
            onChange={handleChange}
            value={formData.phoneNumber}
            className={inputCssStyles}
            required
          />

          {/* STOCK QUANTITY */}
          <label htmlFor="location" className={labelCssStyles}>
            Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={formData.location}
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

export default CreateMerchantModal;
