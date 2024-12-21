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
import { useEffect, useRef, useState } from "react";
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
import { useParams } from "react-router-dom";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

const MoneyTransactions = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openFilter, setOpenFilter] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaymentByUPI, setTotalPaymentByUPI] = useState(0);
  const [totalPaymentByCash, setTotalPaymentByCash] = useState(0);
  const [totalPaymentByCheck, setTotalPaymentByCheck] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiRef = useGridApiRef();

  const { data, error, isLoading } = merchantId
    ? trpc.getMoneyTransactionById.useQuery({ merchantId })
    : trpc.getMoneyTransactions.useQuery();

  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);

  const filteredTransactions = data?.moneyTransaction.filter((transaction) => {
    const transactionDate = dayjs(transaction.transactionDate);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    return (
      (!startDate || transactionDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || transactionDate.isSameOrBefore(endDate, "day"))
    );
  });

  const calculateTransactionsAmount = (
    apiRef: React.MutableRefObject<GridApiCommunity>
  ) => {
    if (
      apiRef.current == null ||
      typeof apiRef.current.getAllRowIds !== "function"
    ) {
      return;
    }

    const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    let totalAmount = 0;
    let totalPaymentByUPI = 0;
    let totalPaymentByCash = 0;
    let totalPaymentByCheck = 0;

    visibleRowIds.forEach((rowId) => {
      const row = apiRef.current.getRow(rowId);
      if (row) {
        totalAmount += row.totalAmount;
        totalPaymentByUPI += row.paymentByUPI;
        totalPaymentByCash += row.paymentByCash;
        totalPaymentByCheck += row.paymentByCheck;
      }
    });

    setTotalAmount(totalAmount);
    setTotalPaymentByUPI(totalPaymentByUPI);
    setTotalPaymentByCash(totalPaymentByCash);
    setTotalPaymentByCheck(totalPaymentByCheck);
  };

  const columns: GridColDef[] = [
    {
      field: "transactionId",
      headerName: "Transaction Id",
      width: 120,
    },
    {
      field: "merchantName",
      headerName: "Merchant Name",
      width: 150,
      valueGetter: (value, row) => `${row.merchant.name}`,
    },
    {
      field: "merchantPhoneNumber",
      headerName: "Merchant Phone Number",
      width: 100,
      valueGetter: (value, row) => `${row.merchant.phoneNumber}`,
    },
    {
      field: "merchantLocation",
      headerName: "Merchant Location",
      width: 200,
      valueGetter: (value, row) => `${row.merchant.location}`,
    },
    {
      field: "transactionOn",
      headerName: "Transaction On",
      width: 200,
      valueGetter: (value, row) => new Date(row.transactionDate),
      valueFormatter: (value) => {
        const date = value as Date;
        return date
          ? `${dayjs(date).format("DD/MM/YYYY")} ${date.toLocaleTimeString()}`
          : ""; // Format the date and time
      },
    },
    {
      field: "paymentType",
      headerName: "Payment Type",
      width: 150,
    },
    {
      field: "paidTo",
      headerName: "Paid To",
      width: 150,
      valueGetter: (value, row) => `${row.paidTo.name}`,
    },
    {
      field: "paymentByUPI",
      headerName: "Payment By UPI",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `₹${row.paymentByUPI}`,
    },
    {
      field: "paymentByCash",
      headerName: "Payment By Cash",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `₹${row.paymentByCash}`,
    },
    {
      field: "paymentByCheck",
      headerName: "Payment By Check",
      width: 150,
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
      field: "totalAmount",
      headerName: "Total Amount",
      width: 100,
      type: "number",
      valueGetter: (value, row) => `₹${row.totalAmount}`,
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
    },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredTransactions]);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch transactions
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-8">
      <div className="flex justify-between items-center mb-6">
        <Header name="Transactions without orders" />
      </div>
      <div className="flex mt-4 text-xl font-bold">
        <h4 className="text-cyan-600">Total Amount: ₹{totalAmount} | </h4>
      </div>
      <hr className="mt-2 border-gray-800 border-1" />
      <div className="flex mt-4 text-xl font-bold">
        <h4 className="text-green-700">
          Total Cash Payment: ₹{totalPaymentByCash} |{" "}
        </h4>
        <h4 className="text-violet-600">
          Total UPI Payment: ₹{totalPaymentByUPI} |{" "}
        </h4>
        <h4 className="text-orange-500">
          Total Check Payment: ₹{totalPaymentByCheck}
        </h4>
      </div>
      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Transaction Filter</DialogTitle>
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
        pageSizeOptions={[15, 30, 50, 100]} // Custom page size options
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 }, // Set default page size to 10
          },
          sorting: {
            sortModel: [{ field: "transactionOn", sort: "desc" }],
          },
        }}
        disableColumnSelector
        rows={filteredTransactions}
        apiRef={apiRef}
        columns={columns}
        getRowId={(row) => row.transactionId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter inputRef={inputRef} />
              <GridToolbar
                csvOptions={{
                  fileName: "Transaction without order data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
              <Button
                onClick={() => setOpenFilter(true)}
                variant="contained"
                color="primary"
              >
                Show Transaction Date Filter
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
                Reset Transaction Date Filter
              </Button>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
        onStateChange={() => calculateTransactionsAmount(apiRef)}
      />
    </div>
  );
};

export default MoneyTransactions;
