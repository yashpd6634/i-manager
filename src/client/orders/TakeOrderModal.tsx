import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import { trpc } from "@/util";
import {
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { CircleX } from "lucide-react";

type OrderFormData = {
  orderId: string;
  merchantId: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    soldPrice: number;
    wholesalePrice: number;
    retailPrice: number;
    availableQuantity: number;
  }[];
  totalBill: number;
  totalPaid: number;
};

type SubmitOrderFormData = {
  orderId: string;
  merchantId: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    soldPrice: number;
  }[];
  totalBill: number;
  totalPaid: number;
};

type CreateOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: SubmitOrderFormData) => void;
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
    totalPaid: 0,
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

  const handleAddProduct = (product: any) => {
    const newProduct = {
      productId: product.productId,
      name: product.name,
      quantity: 1,
      soldPrice: product.wholesalePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      availableQuantity: product.currentQuantity,
    };
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

  const handleTotalPaidChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      totalPaid: parseFloat(e.target.value) || 0,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredFormData = {
      ...formData,
      products: formData.products.map(
        ({ productId, name, quantity, soldPrice }) => ({
          productId,
          name,
          quantity,
          soldPrice,
        })
      ),
    };

    onCreate(filteredFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
        <Header name="Take New Order" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* Merchant Selection */}
          <Autocomplete
            options={merchantData?.merchants || []}
            getOptionLabel={(option) =>
              `${option.name} (Ph - ${option.phoneNumber})` || ""
            }
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
            onChange={(event, value) => value && handleAddProduct(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Products"
                placeholder="Search products"
              />
            )}
            loading={isProductsLoading}
          />

          {/* Products Table */}
          <TableContainer component={Paper} className="mt-4">
            <Table aria-label="Selected Products Table">
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Buying Quantity</TableCell>
                  <TableCell>Selling Price</TableCell>
                  <TableCell>Wholesale Price</TableCell>
                  <TableCell>Retail Price</TableCell>
                  <TableCell>Available Quantity</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.products.map((product, index) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        required
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={product.soldPrice}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "soldPrice",
                            e.target.value
                          )
                        }
                        required
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      ₹{product.wholesalePrice * product.quantity}
                    </TableCell>
                    <TableCell>
                      ₹{product.retailPrice * product.quantity}
                    </TableCell>
                    <TableCell>{product.availableQuantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="text"
                        color="secondary"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            products: prev.products.filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                      >
                        <CircleX />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Bill */}
          <div className="mt-4 text-xl font-bold text-green-500">
            <h4>Total Bill: ₹{formData.totalBill}</h4>
          </div>

          {/* Total Paid */}
          <div className="mt-4">
            <TextField
              label="Total Paid"
              value={formData.totalPaid}
              onChange={handleTotalPaidChange}
              type="number"
              fullWidth
            />
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
