import Header from "@/components/header";
import { trpc } from "@/util";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "productId", headerName: "Product ID", width: 100 },
  { field: "name", headerName: "Product Name", width: 200 },
  {
    field: "wholsalePrice",
    headerName: "Wholsale Price",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `₹${row.wholesalePrice}`,
  },
  {
    field: "retailPrice",
    headerName: "Retail Price",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `₹${row.retailPrice}`,
  },
  {
    field: "purchasedQuantity",
    headerName: "Purchased Quantity",
    width: 100,
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
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.currentQuantity}`,
  },
  {
    field: "godownQuantity",
    headerName: "Godown Stock Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.godownQuantity}`,
  },
  {
    field: "shopQuantity",
    headerName: "Shop Stock Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.shopQuantity}`,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 100,
    type: "date",
    valueGetter: (value, row) => new Date(row.createdAt),
    valueFormatter: (value) => {
      const date = value as Date;
      return date
        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
        : ""; // Format the date and time
    },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 100,
    type: "date",
    valueGetter: (value, row) => new Date(row.updatedAt),
    valueFormatter: (value) => {
      const date = value as Date;
      return date
        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
        : ""; // Format the date and time
    },
  },
];

const Inventory = () => {
  const { data, error, isLoading } = trpc.getProducts.useQuery();
  console.log(data?.products);

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
      <DataGrid
        disableColumnFilter
        disableColumnSelector
        rows={data.products}
        columns={columns}
        getRowId={(row) => row.productId}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Inventory;
