import Header from "@/components/header";
import { trpc } from "@/util";
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useParams } from "react-router-dom";
import { skipToken } from "@tanstack/react-query";

const columns: GridColDef[] = [
  { field: "productId", headerName: "Product ID", width: 100 },
  { field: "name", headerName: "Product Name", width: 200 },
  {
    field: "soldPrice",
    headerName: "Sold Price",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `₹${row.soldPrice}`,
  },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 100,
    type: "number",
    valueGetter: (value, row) => `${row.quantity}`,
  },
];

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: orderData,
    error,
    isLoading,
  } = trpc.getOrderById.useQuery(
    orderId ? { orderId } : skipToken,
    { enabled: Boolean(orderId) } // Only make the query if orderId is available
  );

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error || !orderData?.order || !orderData?.order?.orderedProducts) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products or order details
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        name={`${
          orderData.order.merchant.name
        }'s Order on ${orderData.order.orderDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
      />
      {/* Order Details Cards */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={3}
        className="mt-5"
        justifyContent="space-between"
      >
        {/* Order Details Card */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <Card className="shadow-xl rounded-lg h-full">
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "olivedrab", fontWeight: "bold" }}
                gutterBottom
              >
                Order Details
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Order Date:</strong>{" "}
                {orderData.order.orderDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Bill ID:</strong>{" "}
                {orderData.order.billId}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Payment by UPI:</strong> ₹
                {orderData.order.paymentByUPI}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Payment by Cash:</strong> ₹
                {orderData.order.paymentByCash}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Payment by Check:</strong> ₹
                {orderData.order.paymentByCheck}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Account Type:</strong>{" "}
                {orderData.order.accountType}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Total Bill:</strong> ₹
                {orderData.order.totalBill}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Total Paid:</strong> ₹
                {orderData.order.totalPaid}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Merchant Details Card */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <Card className="shadow-xl rounded-lg h-full">
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "olivedrab", fontWeight: "bold" }}
                gutterBottom
              >
                Merchant Details
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Name:</strong>{" "}
                {orderData.order.merchant.name}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Phone Number:</strong>{" "}
                {orderData.order.merchant.phoneNumber}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Location:</strong>{" "}
                {orderData.order.merchant.location}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Bill Generated By Details Card */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <Card className="shadow-xl rounded-lg h-full">
            <CardContent>
              <Typography
                variant="h6"
                className="flex justify-between"
                sx={{ color: "olivedrab", fontWeight: "bold" }}
                gutterBottom
              >
                Bill Generated By
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Name:</strong>{" "}
                {orderData.order.billGeneratedBy.name}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Phone Number:</strong>{" "}
                {orderData.order.billGeneratedBy.phoneNumber}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Role:</strong>{" "}
                {orderData.order.billGeneratedBy.role}
              </Typography>
              <Typography variant="body1" className="flex justify-between">
                <strong className="text-purple-600">Location:</strong>{" "}
                {orderData.order.billGeneratedBy.location}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <DataGrid
        disableColumnSelector
        rows={orderData.order.orderedProducts}
        columns={columns}
        getRowId={(row) => row.productId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar />
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
    </div>
  );
};

export default OrderDetails;
