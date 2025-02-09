import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
import dayjs from "dayjs";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import GenerateBill from "./GenerateBill";
import { File } from "lucide-react";
import { saveAs } from "file-saver";

export type OrderFormData = {
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
    expiryDate: Date;
    stockSource: "Godown" | "Shop";
  }[];
  billId: string;
  orderDate: Date;
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
  orderDate: Date;
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
  const initialFormState = {
    orderId: v4(),
    merchantId: "",
    products: [],
    billId: "",
    billGeneratedById: "",
    orderDate: new Date(),
    paymentByUPI: 0,
    paymentByCheck: 0,
    paymentByCash: 0,
    accountType: "None",
    totalBill: 0,
    totalPaid: 0,
  };

  const [formData, setFormData] = useState<OrderFormData>(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState); // Reset form data when the modal opens
    }
  }, [isOpen]);

  const [warnings, setWarnings] = useState<{ [key: string]: string }>({});

  const { data: merchantData, isLoading: isMerchantsLoading } =
    trpc.getMerchants.useQuery();
  const { data: productData, isLoading: isProductsLoading } =
    trpc.getProducts.useQuery();
  const { data: employeeData, isLoading: isEmployeeLoading } =
    trpc.getEmployees.useQuery();

  const filteredProductData = productData?.products.filter((product) => {
    const expiryDate = dayjs(product.expiryDate);
    const today = dayjs();

    return expiryDate.isAfter(today, "day") && product.currentQuantity !== 0;
  });

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
      expiryDate: product.expiryDate,
      stockSource: "Godown" as const,
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    // Clear any warnings for this product as it’s added successfully
    if (newProduct.availableQuantity < newProduct.quantity) {
      setWarnings((prev) => ({
        ...prev,
        [newProduct.productId]: "Quantity exceeds available stock!",
      }));
    } else {
      setWarnings((prev) => {
        const { [newProduct.productId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSourceChange = (
    index: number,
    stockSource: "Godown" | "Shop"
  ) => {
    const newProducts = [...formData.products];
    const product = filteredProductData?.find(
      (p) => p.productId === newProducts[index].productId
    );
    if (product) {
      newProducts[index].stockSource = stockSource;
      newProducts[index].availableQuantity =
        stockSource === "Godown"
          ? product.currentQuantity - product.inShopQuantity
          : product.inShopQuantity;

      // Check if quantity exceeds available quantity and set warnings
      if (newProducts[index].quantity > newProducts[index].availableQuantity) {
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
    }
  };

  const handleProductChange = (index: number, field: string, val: string) => {
    const newProducts = [...formData.products];
    const value = parseFloat(val);

    // Ensure the value is a valid number and not less than 0
    if (!isNaN(value) && value >= 0) {
      newProducts[index] = {
        ...newProducts[index],
        [field]: value,
      };

      // Check if quantity exceeds available quantity and set warnings
      if (
        field === "quantity" &&
        value > newProducts[index].availableQuantity
      ) {
        setWarnings((prev) => ({
          ...prev,
          [newProducts[index].productId]: "Quantity exceeds available stock!",
        }));
      } else if (field === "quantity") {
        setWarnings((prev) => {
          const { [newProducts[index].productId]: _, ...rest } = prev;
          return rest;
        });
      }

      setFormData({ ...formData, products: newProducts });
      updateTotalBill(newProducts);
    } else if (val === "") {
      // If the input is empty, set the quantity to 0
      newProducts[index] = {
        ...newProducts[index],
        [field]: 0,
      };

      setFormData({ ...formData, products: newProducts });
      updateTotalBill(newProducts);
    }
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

  const generatePdfDocument = async () => {
    const blob = await pdf(
      <GenerateBill
        orderData={formData}
        merchantData={merchantData?.merchants}
      />
    ).toBlob();
    saveAs(
      blob,
      `Order-${new Date().toLocaleDateString("en-GB")}-${formData.orderId}`
    );
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "orderDate" ? new Date(value) : value,
    });
  };

  const formattedBillingDate = formData.orderDate
    ? formData.orderDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredFormData = {
      ...formData,
      totalBill: Math.ceil(formData.totalBill),
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-screen-xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between">
          <Header name="Take New Order" />
          {/* <PDFDownloadLink document={<GenerateBill />} fileName="invoice.pdf"> */}
          <Button
            color="primary"
            variant="contained"
            onClick={generatePdfDocument}
          >
            <File className="m-2" />
            Generate Bill
          </Button>
          {/* </PDFDownloadLink> */}
        </div>
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
            options={filteredProductData || []}
            getOptionLabel={(option) =>
              `${option.name} (Expired on - ${dayjs(option.expiryDate).format(
                "DD/MM/YYYY"
              )}) (Id - ${option.productId})` || ""
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
                  <TableCell>Selling Price per quantity</TableCell>
                  <TableCell>Selling Price</TableCell>
                  <TableCell>Wholesale Price</TableCell>
                  <TableCell>Retail Price</TableCell>
                  <TableCell>Available Quantity</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Stock Source</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.products.map((product, index) => (
                  <TableRow key={product.productId}>
                    <TableCell sx={{ width: 5 }}>{product.productId}</TableCell>
                    <TableCell sx={{ width: 5 }}>{product.name}</TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <TextField
                        type="text"
                        inputMode="numeric"
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
                    <TableCell sx={{ maxWidth: 150 }}>
                      <TextField
                        type="text"
                        inputMode="numeric"
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
                      ₹{product.soldPrice * product.quantity}
                    </TableCell>
                    <TableCell>
                      ₹{product.wholesalePrice * product.quantity}
                    </TableCell>
                    <TableCell>
                      ₹{product.retailPrice * product.quantity}
                    </TableCell>
                    <TableCell>{product.availableQuantity}</TableCell>
                    <TableCell>
                      {product.expiryDate.toLocaleDateString("en-GB")}
                    </TableCell>
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
                        onClick={() => {
                          setWarnings((prev) => {
                            const { [product.productId]: _, ...rest } = prev;
                            return rest;
                          });
                          setFormData((prev) => ({
                            ...prev,
                            products: prev.products.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
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

          {/* Order Date */}
          <TextField
            label="Order Date"
            name="orderDate"
            type="date"
            onChange={handleDateChange}
            value={formattedBillingDate}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

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
                  orderId: "",
                  merchantId: "",
                  products: [],
                  billId: "",
                  orderDate: new Date(),
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
