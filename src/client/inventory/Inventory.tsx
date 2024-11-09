import Header from "@/components/header";
import { trpc } from "@/util";
import { Button, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useState } from "react";

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
    field: "inGodownQuantity",
    headerName: "Godown Stock Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.currentQuantity - row.inShopQuantity}`,
  },
  {
    field: "inShopQuantity",
    headerName: "Shop Stock Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.inShopQuantity}`,
  },
  {
    field: "moveToShop",
    headerName: "Actions",
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
        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
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
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Inventory;
