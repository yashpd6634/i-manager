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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
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
    stockSource: "Godown" | "Shop";
  }[];
  billId: string;
  billGeneratedById: string;
  paymentByUPI: number;
  paymentByCheck: number;
  paymentByCash: number;
  accountType: string;
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
    stockSource: "Godown" | "Shop";
  }[];
  billId: string;
  billGeneratedById: string;
  paymentByUPI: number;
  paymentByCheck: number;
  paymentByCash: number;
  accountType: string;
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
    billId: "",
    billGeneratedById: "",
    paymentByUPI: 0,
    paymentByCheck: 0,
    paymentByCash: 0,
    accountType: "None",
    totalBill: 0,
    totalPaid: 0,
  });
  const [warnings, setWarnings] = useState<{ [key: string]: string }>({});

  const { data: merchantData, isLoading: isMerchantsLoading } =
    trpc.getMerchants.useQuery();
  const { data: productData, isLoading: isProductsLoading } =
    trpc.getProducts.useQuery();
  const { data: employeeData, isLoading: isEmployeeLoading } =
    trpc.getEmployees.useQuery();

  const handleMerchantChange = (value: { merchantId: string } | null) => {
    setFormData((prev) => ({
      ...prev,
      merchantId: value?.merchantId || "",
    }));
  };

  const handleEmployeeChange = (value: { employeeId: string } | null) => {
    console.log(value);
    setFormData((prev) => ({
      ...prev,
      billGeneratedById: value?.employeeId || "",
    }));
  };

  const handleAddProduct = (product: any) => {
    // Check if the product already exists in the formData
    const existingProduct = formData.products.find(
      (p) => p.productId === product.productId
    );

    if (existingProduct) {
      // Set a warning for duplicate product
      setWarnings((prev) => ({
        ...prev,
        [product.productId]: "Product is already added to the order.",
      }));
      return; // Exit the function to avoid adding the duplicate product
    }

    const godownQuantity = product.currentQuantity - product.inShopQuantity;
    const newProduct = {
      productId: product.productId,
      name: product.name,
      quantity: 1,
      soldPrice: product.wholesalePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      availableQuantity: godownQuantity,
      stockSource: "Godown" as const,
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    // Clear any warnings for this product as it’s added successfully
    setWarnings((prev) => {
      const { [product.productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSourceChange = (
    index: number,
    stockSource: "Godown" | "Shop"
  ) => {
    const newProducts = [...formData.products];
    const product = productData?.products.find(
      (p) => p.productId === newProducts[index].productId
    );
    if (product) {
      newProducts[index].stockSource = stockSource;
      newProducts[index].availableQuantity =
        stockSource === "Godown"
          ? product.currentQuantity - product.inShopQuantity
          : product.inShopQuantity;
      setFormData({ ...formData, products: newProducts });
    }
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const newProducts = [...formData.products];
    const quantity = parseFloat(value);

    newProducts[index] = {
      ...newProducts[index],
      [field]: quantity,
    };

    // Check if quantity exceeds available quantity and set warnings
    if (
      field === "quantity" &&
      quantity > newProducts[index].availableQuantity
    ) {
      setWarnings((prev) => ({
        ...prev,
        [newProducts[index].productId]: "Quantity exceeds available stock!",
      }));
    } else {
      setWarnings((prev) => {
        const { [newProducts[index].productId]: _, ...rest } = prev;
        return rest;
      });
    }

    setFormData({ ...formData, products: newProducts });
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

  const handleValueChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
    field:
      | "totalPaid"
      | "billId"
      | "paymentByUPI"
      | "paymentByCash"
      | "paymentByCheck"
      | "accountType"
  ) => {
    if (field === "accountType" || field === "billId") {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    } else {
      const value = parseFloat(e.target.value) || 0;
      const updatedFormData = {
        ...formData,
        [field]: value,
      };

      updatedFormData.totalPaid =
        updatedFormData.paymentByCash +
        updatedFormData.paymentByCheck +
        updatedFormData.paymentByUPI;
      setFormData((prev) => updatedFormData);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredFormData = {
      ...formData,
      products: formData.products.map(
        ({ productId, name, quantity, soldPrice, stockSource }) => ({
          productId,
          name,
          quantity,
          soldPrice,
          stockSource,
        })
      ),
    };

    onCreate(filteredFormData);
    setFormData({
      orderId: v4(),
      merchantId: "",
      products: [],
      billId: "",
      billGeneratedById: "",
      paymentByUPI: 0,
      paymentByCheck: 0,
      paymentByCash: 0,
      accountType: "None",
      totalBill: 0,
      totalPaid: 0,
    });
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
                  <TableCell>Stock Source</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.products.map((product, index) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell sx={{ width: 150 }}>
                      <TextField
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        required
                        fullWidth
                      />
                      {/* Display warning if quantity exceeds available stock */}
                      {warnings[product.productId] && (
                        <div className="text-red-500 text-sm">
                          {warnings[product.productId]}
                        </div>
                      )}
                      {warnings.duplicateProduct && (
                        <div className="text-red-500 text-sm mt-2">
                          {warnings.duplicateProduct}
                        </div>
                      )}
                    </TableCell>
                    <TableCell sx={{ width: 150 }}>
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
                      <FormControl fullWidth>
                        <InputLabel>Stock Source</InputLabel>
                        <Select
                          value={product.stockSource}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              e.target.value as "Godown" | "Shop"
                            )
                          }
                          label="Stock Source"
                        >
                          <MenuItem value="Godown">Godown</MenuItem>
                          <MenuItem value="Shop">Shop</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ width: 10 }}>
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

          {/* Bill ID */}
          <div className="mt-4">
            <TextField
              label="Bill ID"
              value={formData.billId}
              onChange={(e) => handleValueChange(e, "billId")}
              type="text"
              fullWidth
            />
          </div>

          {/* Employee Selection */}
          <Autocomplete
            options={employeeData?.employees || []}
            className="my-4"
            getOptionLabel={(option) =>
              `${option.name} (Ph - ${option.phoneNumber})` || ""
            }
            onChange={(event, value) => handleEmployeeChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Bill Generated By"
                placeholder="Search employees"
                fullWidth
                required
              />
            )}
            loading={isEmployeeLoading}
          />

          {/* Payment By UPI */}
          <div className="mt-4">
            <TextField
              label="Payment By UPI"
              value={formData.paymentByUPI}
              onChange={(e) => handleValueChange(e, "paymentByUPI")}
              type="text"
              inputMode="numeric"
              fullWidth
            />
          </div>

          {/* Payment By Cash */}
          <div className="mt-4">
            <TextField
              label="Payment By Cash"
              value={formData.paymentByCash}
              onChange={(e) => handleValueChange(e, "paymentByCash")}
              type="text"
              inputMode="numeric"
              fullWidth
            />
          </div>

          {/* Payment By Check */}
          <div className="mt-4">
            <TextField
              label="Payment By Check"
              value={formData.paymentByCheck}
              onChange={(e) => handleValueChange(e, "paymentByCheck")}
              type="text"
              inputMode="numeric"
              fullWidth
            />
          </div>

          {/* Select Account */}
          <InputLabel className="mt-2" id="billGeneratedBy">
            Account
          </InputLabel>
          <Select
            labelId="billGeneratedBy"
            id="billGeneratedBy"
            className="mb-2"
            value={formData.accountType}
            onChange={(e) => handleValueChange(e, "accountType")}
            label="Account"
            fullWidth
          >
            <MenuItem value="Personal">Personal</MenuItem>
            <MenuItem value="Firm">Firm</MenuItem>
            <MenuItem value="None">None</MenuItem>
          </Select>

          {/* Total Paid */}
          <div className="mt-4">
            <TextField
              label="Total Paid"
              value={formData.totalPaid}
              onChange={(e) => handleValueChange(e, "totalPaid")}
              type="text"
              inputMode="numeric"
              disabled
              fullWidth
            />
          </div>

          {/* Submit and Cancel Actions */}
          <div className="mt-4 flex">
            <button
              type="submit"
              disabled={Object.keys(warnings).length !== 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Take Order
            </button>
            <button
              onClick={() => {
                setFormData({
                  orderId: v4(),
                  merchantId: "",
                  products: [],
                  billId: "",
                  billGeneratedById: "",
                  paymentByUPI: 0,
                  paymentByCheck: 0,
                  paymentByCash: 0,
                  accountType: "None",
                  totalBill: 0,
                  totalPaid: 0,
                });
                onClose();
              }}
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
