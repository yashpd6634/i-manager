import Header from "@/components/header";
import { trpc } from "@/util";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useState } from "react";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Create a separate component for the MoveToShop action
const MoveToShopComponent = ({
  productId,
  currentQuantity,
  inShopQuantity,
}: {
  productId: string;
  currentQuantity: number;
  inShopQuantity: number;
}) => {
  const [quantity, setQuantity] = useState<number | string>("");
  const mutation = trpc.moveStockToShop.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
  };

  const handleMoveToShop = () => {
    const moveQuantity = Number(quantity);

    if (!moveQuantity || moveQuantity <= 0) {
      alert("Please enter a valid quantity to move.");
      return;
    }

    if (moveQuantity > currentQuantity - inShopQuantity) {
      alert("Insufficient godown stock.");
      return;
    }

    console.log(
      `Moving ${moveQuantity} units from godown to shop for product ${productId}`
    );

    // Call the mutation to update stock
    mutation.mutate({
      productId: productId,
      quantity: moveQuantity,
    });
    setQuantity(""); // Reset quantity after transfer
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingTop: "0.5rem",
      }}
    >
      <TextField
        size="small"
        type="number"
        label="Quantity"
        value={quantity}
        onChange={handleQuantityChange}
        variant="outlined"
      />
      <Button onClick={handleMoveToShop} variant="contained" color="primary">
        Move
      </Button>
    </div>
  );
};

const columns: GridColDef[] = [
  { field: "productId", headerName: "Product ID", width: 100 },
  { field: "name", headerName: "Product Name", width: 200 },
  {
    field: "wholesalePrice",
    headerName: "Wholesale Price",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `₹${row.wholesalePrice}`,
  },
  {
    field: "retailPrice",
    headerName: "Retail Price",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `₹${row.retailPrice}`,
  },
  {
    field: "piecesPerQuantity",
    headerName: "Pieces Per Quantity",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `${row.piecesPerQuantity}`,
  },
  {
    field: "purchasedQuantity",
    headerName: "Purchased Quantity",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `${row.purchasedQuantity}`,
  },
  {
    field: "expiryDate",
    headerName: "Expiry Date",
    width: 100,
    type: "date",
    valueGetter: (value, row) => {
      const date = row.expiryDate;
      return date ? new Date(date) : null;
    },
    valueFormatter: (value) => {
      const date = value;
      return date ? dayjs(date).format("DD/MM/YYYY") : ""; // Formats the date
    },
  },
  {
    field: "daysUntilExpiry",
    headerName: "Days Until Expiry",
    width: 120,
    type: "number",
    valueGetter: (value, row) => {
      const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;
      if (!expiryDate) return null;

      const currentDate = new Date();
      const diffInMilliseconds = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(
        diffInMilliseconds / (1000 * 60 * 60 * 24)
      );

      return daysUntilExpiry >= 0 ? daysUntilExpiry : 0; // Show 0 if the product is expired
    },
    valueFormatter: (value) => {
      const days = value as number;
      return `${days} days left`;
    },
  },
  {
    field: "soldQuantity",
    headerName: "Sold Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) =>
      `${row.purchasedQuantity - row.currentQuantity}`,
  },
  {
    field: "currentQuantity",
    headerName: "Current Stock Quantity",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `${row.currentQuantity}`,
  },
  {
    field: "inGodownQuantity",
    headerName: "Godown Stock Quantity",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `${row.currentQuantity - row.inShopQuantity}`,
  },
  {
    field: "inShopQuantity",
    headerName: "Shop Stock Quantity",
    width: 120,
    type: "number",
    valueGetter: (value, row) => `${row.inShopQuantity}`,
  },
  {
    field: "moveToShop",
    headerName: "Move to shop",
    width: 200,
    renderCell: (params) => {
      const { productId, currentQuantity, inShopQuantity } = params.row;
      return (
        <MoveToShopComponent
          productId={productId}
          currentQuantity={currentQuantity}
          inShopQuantity={inShopQuantity}
        />
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 150,
    type: "date",
    valueGetter: (value, row) => new Date(row.createdAt),
    valueFormatter: (value) => {
      const date = value as Date;
      return date
        ? `${dayjs(date).format("DD/MM/YYYY")} ${date.toLocaleTimeString()}`
        : ""; // Format the date and time
    },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 150,
    type: "date",
    valueGetter: (value, row) => new Date(row.updatedAt),
    valueFormatter: (value) => {
      const date = value as Date;
      return date
        ? `${dayjs(date).format("DD/MM/YYYY")} ${date.toLocaleTimeString()}`
        : ""; // Format the date and time
    },
  },
];

const Inventory = () => {
  const { data, error, isLoading } = trpc.getProducts.useQuery();
  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);

  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);

  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  const handleResetFilter = () => {
    setDateRange([
      { startDate: undefined, endDate: undefined, key: "selection" },
    ]);
  };

  const filteredProducts = data?.products.filter((product) => {
    const expiryDate = dayjs(product.expiryDate);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;
    const today = dayjs();

    return (
      (!startDate || expiryDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || expiryDate.isSameOrBefore(endDate, "day")) &&
      expiryDate.isAfter(today, "day") &&
      product.currentQuantity !== 0
    );
  });

  const expiredProducts = data?.products.filter((product) => {
    const expiryDate = dayjs(product.expiryDate);
    const today = dayjs(); // Current date

    return expiryDate.isBefore(today, "day"); // Only include products that expired before today
  });

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error || !data?.products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
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
      <DataGrid
        disableColumnSelector
        rows={filteredProducts}
        columns={columns}
        getRowId={(row) => row.productId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar
                csvOptions={{
                  fileName: "Product data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
              <Button
                onClick={() => setOpenDialog(true)}
                variant="contained"
                color="primary"
              >
                Show Expiry Date Filter
              </Button>
              <Button
                onClick={handleResetFilter}
                color="secondary"
                variant="outlined"
              >
                Reset Expiry Date Filter
              </Button>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
      <div className="mt-4">
        <Header name="Expired Products" />
        <DataGrid
          disableColumnSelector
          rows={expiredProducts}
          columns={columns}
          getRowId={(row) => row.productId}
          slots={{
            toolbar: () => (
              <GridToolbar
                csvOptions={{
                  fileName: "Expired Product",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
            ),
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
        />
      </div>
    </div>
  );
};

export default Inventory;
