import Header from "@/components/header";
import { trpc } from "@/util";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import TakeOrderModal from "./TakeOrderModal";

const columns: GridColDef[] = [
  { field: "orderId", headerName: "Order ID", width: 150 },
  { field: "merchantName", headerName: "Merchant Name", width: 200 },
  {
    field: "merchantPhoneNumber",
    headerName: "Merchant Phone Number",
    width: 180,
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
        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
        : "";
    },
  },
  { field: "totalBill", headerName: "Total Bill", width: 150, type: "number" },
];

type OrderFormData = {
  orderId: string;
  merchantId: string;
  products: { productId: string; quantity: number; soldPrice: number }[];
  totalBill: number;
};

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, error, isLoading } = trpc.getOrders.useQuery(); // Assuming you have a query that fetches orders with merchant data

  const mutation = trpc.takeOrder.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const handleTakeOrder = (orderData: OrderFormData) => {
    // mutation.mutate(orderData);
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

  const rows = data.orders.map((order) => ({
    orderId: order.orderId,
    merchantName: order.merchant.name,
    merchantPhoneNumber: order.merchant.phoneNumber,
    merchantLocation: order.merchant.location,
    orderDate: order.orderDate,
    totalBill: order.totalBill,
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
      <DataGrid
        disableColumnFilter
        disableColumnSelector
        rows={rows}
        columns={columns}
        getRowId={(row) => row.orderId}
        slots={{ toolbar: GridToolbar }}
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
