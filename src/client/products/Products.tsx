import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CreateProductModal from "./CreateProductModal";
import { trpc } from "@/util";
import Header from "@/components/header";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DateRangePicker } from "react-date-range";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import UpdateProductModal from "./UpdateProductModal";

type ProductFormData = {
  productId: string;
  name: string;
  piecesPerQuantity: number;
  wholesalePrice: string;
  retailPrice: string;
  purchasedQuantity: number;
  expiryDate: Date;
};

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateProductId, setUpdateProductId] = useState("");

  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);

  const { data, isLoading, isError, refetch } =
    trpc.getProducts.useQuery(searchTerm);
  const createMutation = trpc.createProduct.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      refetch();
    },
  });
  const updateMutation = trpc.updateProduct.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      refetch();
    },
  });

  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  const handleResetFilter = () => {
    setDateRange([
      { startDate: undefined, endDate: undefined, key: "selection" },
    ]);
  };

  const handleCreateProduct = (productData: ProductFormData) => {
    createMutation.mutate({
      ...productData,
      wholesalePrice: parseFloat(
        parseFloat(productData.wholesalePrice).toFixed(2)
      ),
      retailPrice: parseFloat(parseFloat(productData.retailPrice).toFixed(2)),
    });
  };

  const handleUpdateProduct = (productData: ProductFormData) => {
    updateMutation.mutate({
      ...productData,
      wholesalePrice: parseFloat(
        parseFloat(productData.wholesalePrice).toFixed(2)
      ),
      retailPrice: parseFloat(parseFloat(productData.retailPrice).toFixed(2)),
    });
  };

  const products = data?.products.filter((product) => {
    const purchasedDate = dayjs(product.createdAt);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    return (
      (!startDate || purchasedDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || purchasedDate.isSameOrBefore(endDate, "day")) &&
      product.currentQuantity !== 0
    );
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [data]);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !data?.products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Expired Filter</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <DateRangePicker
              ranges={dateRange}
              onChange={handleDateRangeChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            ref={inputRef}
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* FILTER */}
      <Box display="flex" gap={2} alignItems="center" padding={1}>
        <Button
          onClick={() => setOpenDialog(true)}
          variant="contained"
          color="primary"
        >
          Show Purchase Date Filter
        </Button>
        <Button
          onClick={handleResetFilter}
          color="secondary"
          variant="outlined"
        >
          Reset Purchase Date Filter
        </Button>
      </Box>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Product
        </button>
      </div>

      {/* BODY PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between">
        {false ? (
          <div>Loading...</div>
        ) : (
          products?.map((product) => (
            <div
              key={product.productId}
              className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
            >
              <div className="flex flex-col items-center">
                <img
                  src="../assets/PM_TradeWorld_Flex.jpeg"
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mb-3 rounded-2xl w-36 h-36"
                />
                <h3 className="text-lg text-gray-900 font-semibold">
                  {product.name}
                </h3>
                <p className="text-gray-600 font-semibold">
                  Wholsale Price: ₹{product.wholesalePrice.toFixed(2)}
                </p>
                <p className="text-gray-600 font-semibold">
                  Retail Price: ₹{product.retailPrice.toFixed(2)}
                </p>
                <div className="text-sm text-gray-600 mt-1 font-semibold">
                  Pieces per quantity: {product.piecesPerQuantity}
                </div>
                <div className="text-sm text-gray-600 mt-1 font-semibold">
                  Stock: {product.currentQuantity}
                </div>
                <div className="text-sm text-gray-600 mt-1 mb-2 font-semibold">
                  Purchased Date:{" "}
                  {product.createdAt.toLocaleDateString("en-GB")}
                </div>
                <Button
                  onClick={() => {
                    setUpdateProductId(product.productId);
                    setIsUpdateModalOpen(true);
                  }}
                  color="warning"
                  variant="contained"
                >
                  <div className="font-bold">Update</div>
                </Button>
                {/* {product.rating && (
                  <div className="flex items-center mt-2">
                    <Rating rating={product.rating} />
                  </div>
                )} */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
      <UpdateProductModal
        productId={updateProductId}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
};

export default Products;
