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
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import TakeOrderModal from "./TakeOrderModal";
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
import { GridApiCommunity } from "@mui/x-data-grid/internals";

const columns: GridColDef[] = [
  { field: "orderId", headerName: "Order ID", width: 100 },
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
    valueGetter: (value, row) => `₹${row.totalPaid}`,
  },
];

type OrderFormData = {
  orderId: string;
  merchantId: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    soldPrice: number;
    stockSource: "Godown" | "Shop";
  }[];
  totalBill: number;
  totalPaid: number;
};

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openFilter, setOpenFilter] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const apiRef = useGridApiRef();

  const { data, error, isLoading } = trpc.getOrders.useQuery(); // Assuming you have a query that fetches orders with merchant data

  const mutation = trpc.takeOrder.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const filteredProducts = data?.orders.filter((order) => {
    const orderDate = dayjs(order.orderDate);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    return (
      (!startDate || orderDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || orderDate.isSameOrBefore(endDate, "day"))
    );
  });

  const calculateExpenses = (
    apiRef: React.MutableRefObject<GridApiCommunity>
  ) => {
    if (
      apiRef.current == null ||
      typeof apiRef.current.getAllRowIds !== "function"
    ) {
      return;
    }

    const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    let totalBill = 0;
    let totalPaid = 0;
    const categoryAmounts: Record<
      string,
      { category: string; amount: number }
    > = {};

    visibleRowIds.forEach((rowId) => {
      const row = apiRef.current.getRow(rowId);
      if (row) {
        totalBill += row.totalBill;
        totalPaid += row.totalPaid;
      }
    });

    setTotalBill(totalBill);
    setTotalPaid(totalPaid);
  };

  const handleTakeOrder = (orderData: OrderFormData) => {
    mutation.mutate(orderData);
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error || !data?.orders) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch orders
      </div>
    );
  }

  const rows = filteredProducts?.map((order) => ({
    orderId: order.orderId,
    merchantName: order.merchant.name,
    merchantPhoneNumber: order.merchant.phoneNumber,
    merchantLocation: order.merchant.location,
    orderDate: order.orderDate,
    totalBill: order.totalBill,
    totalPaid: order.totalPaid,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header name="Orders" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Take Order
        </button>
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
        disableColumnSelector
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.orderId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar />
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
              <Button
                onClick={() => {
                  calculateExpenses(apiRef);
                }}
                variant="contained"
                color="warning"
              >
                Calculate Bills
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
      />

      <TakeOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleTakeOrder}
      />
    </div>
  );
};

export default Orders;
