import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import { trpc } from "@/util";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  SelectChangeEvent,
} from "@mui/material";
import { CircleX } from "lucide-react";

type OrderFormData = {
  orderId: string;
  merchantId: string;
  products: { productId: string; quantity: number; soldPrice: number }[];
  totalBill: number;
};

type CreateOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: OrderFormData) => void;
};

const TakeOrderModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateOrderModalProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    orderId: v4(),
    merchantId: "",
    products: [],
    totalBill: 0,
  });

  const { data: merchantData, isLoading: isMerchantsLoading } =
    trpc.getMerchants.useQuery();
  const { data: productData, isLoading: isProductsLoading } =
    trpc.getProducts.useQuery();

  const handleMerchantChange = (value: { merchantId: string } | null) => {
    setFormData((prev) => ({
      ...prev,
      merchantId: value?.merchantId || "",
    }));
  };

  const handleAddProduct = (productId: string) => {
    const newProduct = { productId, quantity: 1, soldPrice: 0 };
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...formData.products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: parseFloat(value),
    };
    setFormData({
      ...formData,
      products: newProducts,
    });
    updateTotalBill(newProducts);
  };

  const updateTotalBill = (
    products: { productId: string; quantity: number; soldPrice: number }[]
  ) => {
    const totalBill = products.reduce(
      (sum, product) => sum + product.quantity * product.soldPrice,
      0
    );
    setFormData((prev) => ({ ...prev, totalBill }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Take New Order" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* Merchant Selection */}
          <Autocomplete
            options={merchantData?.merchants || []}
            getOptionLabel={(option) => option.name || ""}
            onChange={(event, value) => handleMerchantChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Merchant"
                placeholder="Search merchants"
                fullWidth
                required
              />
            )}
            loading={isMerchantsLoading}
          />

          {/* Product Selection with Searchable Dropdown */}
          <Autocomplete
            className="my-4"
            options={productData?.products || []}
            getOptionLabel={(option) =>
              `${option.name} (ID - ${option.productId})` || ""
            }
            onChange={(event, value) =>
              value && handleAddProduct(value.productId)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Products"
                placeholder="Search products"
              />
            )}
          />

          {/* Display selected products and inputs for quantity and sold price */}
          {formData.products.map((product, index) => (
            <div key={index} className="flex items-center my-4">
              <TextField
                label="Quantity"
                type="number"
                value={product.quantity}
                onChange={(e) =>
                  handleProductChange(index, "quantity", e.target.value)
                }
                required
                className="mr-2"
              />
              <TextField
                label="Sold Price"
                type="number"
                value={product.soldPrice}
                onChange={(e) =>
                  handleProductChange(index, "soldPrice", e.target.value)
                }
                required
                className="mr-2"
              />
              <Button
                variant="text"
                color="secondary"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    products: prev.products.filter((_, i) => i !== index),
                  }))
                }
              >
                <CircleX />
              </Button>
            </div>
          ))}

          {/* Total Bill */}
          <div className="mt-4">
            <h4>Total Bill: ₹{formData.totalBill}</h4>
          </div>

          {/* Submit and Cancel Actions */}
          <div className="mt-4 flex">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Take Order
            </button>
            <button
              onClick={onClose}
              type="button"
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TakeOrderModal;
