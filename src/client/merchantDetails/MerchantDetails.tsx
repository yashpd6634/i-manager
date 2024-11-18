import Header from "@/components/header";
import { trpc } from "@/util";
import {
  DataGrid,
  GridColDef,
  gridFilteredSortedRowIdsSelector,
  GridToolbar,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import MoneyTransactions from "@/merchants/MoneyTransactionsTable";

const MerchantDetails = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openFilter, setOpenFilter] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const apiRef = useGridApiRef();
  const navigate = useNavigate();

  // Fetch orders for the particular merchant
  const { data, error, isLoading } = trpc.getOrders.useQuery();

  const searchMerchantId = merchantId || "";
  const {
    data: merchantData,
    error: isMerchantDataError,
    isLoading: isMerchantDataLoading,
  } = trpc.getMerchantById.useQuery({ merchantId: searchMerchantId });

  // Filter orders by merchantId
  const filteredOrders = data?.orders.filter((order) => {
    const orderDate = dayjs(order.orderDate);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    return (
      (!startDate || orderDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || orderDate.isSameOrBefore(endDate, "day")) &&
      order.merchantId === merchantId
    );
  });

  const calculateBill = (apiRef: React.MutableRefObject<GridApiCommunity>) => {
    if (
      apiRef.current == null ||
      typeof apiRef.current.getAllRowIds !== "function"
    ) {
      return;
    }

    const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    let totalBill = 0;
    let totalPaid = 0;

    visibleRowIds.forEach((rowId: any) => {
      const row = apiRef.current.getRow(rowId);
      if (row) {
        totalBill += row.totalBill;
        totalPaid += row.totalPaid;
      }
    });

    setTotalBill(totalBill);
    setTotalPaid(totalPaid);
  };

  const columns: GridColDef[] = [
    {
      field: "orderId",
      headerName: "Order ID",
      width: 120,
      renderCell: (params: any) => {
        const orderId = params.row.orderId; // Assuming each row has merchantId
        return (
          <Button
            onClick={() => navigate(`/orders/${orderId}`)} // Navigate to merchant page with merchantId
            variant="text"
            color="primary"
          >
            {params.row.orderId}
          </Button>
        );
      },
    },
    { field: "merchantName", headerName: "Merchant Name", width: 150 },
    {
      field: "merchantPhoneNumber",
      headerName: "Merchant Phone Number",
      width: 100,
    },
    { field: "merchantLocation", headerName: "Merchant Location", width: 200 },
    {
      field: "orderDate",
      headerName: "Order Date",
      width: 180,
      type: "date",
      valueGetter: (value, row) => new Date(row.orderDate),
      valueFormatter: (value) => {
        const date = value as Date;
        return date
          ? `${dayjs(date).format("DD/MM/YYYY")} ${date.toLocaleTimeString()}`
          : "";
      },
    },
    {
      field: "billId",
      headerName: "Bill ID",
      width: 100,
      type: "string",
      valueGetter: (value, row) => `${row.billId}`,
    },
    {
      field: "paymentByUPI",
      headerName: "Payment By UPI",
      width: 100,
      type: "number",
      valueGetter: (value, row) => `₹${row.paymentByUPI}`,
    },
    {
      field: "paymentByCash",
      headerName: "Payment By Cash",
      width: 100,
      type: "number",
      valueGetter: (value, row) => `₹${row.paymentByCash}`,
    },
    {
      field: "paymentByCheck",
      headerName: "Payment By Check",
      width: 100,
      type: "number",
      valueGetter: (value, row) => `₹${row.paymentByCheck}`,
    },
    {
      field: "accountType",
      headerName: "Account Type",
      width: 100,
      type: "string",
      valueGetter: (value, row) => `${row.accountType}`,
    },
    {
      field: "totalBill",
      headerName: "Total Bill",
      width: 100,
      type: "number",
      valueGetter: (value, row) => `₹${row.totalBill}`,
    },
    {
      field: "totalPaid",
      headerName: "Total Paid",
      width: 100,
      type: "number",
      valueGetter: (value, row) =>
        `₹${row.paymentByUPI + row.paymentByCash + row.paymentByCheck}`,
    },
  ];

  if (isLoading || isMerchantDataLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error || !data?.orders || isMerchantDataError) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch orders
      </div>
    );
  }

  const rows = filteredOrders?.map((order) => ({
    orderId: order.orderId,
    merchantName: order.merchant.name,
    merchantPhoneNumber: order.merchant.phoneNumber,
    merchantLocation: order.merchant.location,
    orderDate: order.orderDate,
    billId: order.billId,
    paymentByUPI: order.paymentByUPI,
    paymentByCash: order.paymentByCash,
    paymentByCheck: order.paymentByCheck,
    accountType: order.accountType,
    totalBill: order.totalBill,
    totalPaid: order.totalPaid,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header name={`${merchantData?.merchant?.name}'s Orders`} />
      </div>
      <div className="flex mt-4 text-xl font-bold">
        <h4 className="text-cyan-600">Total Bill: ₹{totalBill} | </h4>
        <h4 className="text-lime-600">Total Paid: ₹{totalPaid}</h4>
      </div>
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Popup Title</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <DateRangePicker
              ranges={dateRange}
              onChange={(ranges: any) => setDateRange([ranges.selection])}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilter(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.orderId}
        checkboxSelection
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar
                csvOptions={{
                  fileName: "Merchant Details data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
              <Button
                onClick={() => setOpenFilter(true)}
                variant="contained"
                color="primary"
              >
                Show Order Date Filter
              </Button>
              <Button
                onClick={() =>
                  setDateRange([
                    {
                      startDate: undefined,
                      endDate: undefined,
                      key: "selection",
                    },
                  ])
                }
                color="secondary"
                variant="outlined"
              >
                Reset Order Date Filter
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
        onStateChange={() => calculateBill(apiRef)}
      />
      <MoneyTransactions />
    </div>
  );
};

export default MerchantDetails;
