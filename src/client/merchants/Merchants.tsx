import Header from "@/components/header";
import { trpc } from "@/util";
import { Box, Button, TextField } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import AddMerchantModal from "./AddMerchantModal";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { MoneyTransfer } from "./MoneyTransfer";
import MoneyTransactions from "./MoneyTransactionsTable";

type MerchantFormData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
  balance: number;
};

const Merchants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isError, isLoading } = trpc.getMerchants.useQuery();
  const mutation = trpc.addMerchant.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const handleAddMerchant = (merchantData: MerchantFormData) => {
    mutation.mutate(merchantData);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params: any) => {
        const merchantId = params.row.merchantId; // Assuming each row has merchantId
        return (
          <Button
            onClick={() => navigate(`/merchants/${merchantId}`)} // Navigate to merchant page with merchantId
            variant="text"
            color="primary"
          >
            {params.row.name}
          </Button>
        );
      },
    },
    { field: "phoneNumber", headerName: "Phone Number", width: 100 },
    { field: "location", headerName: "Location", width: 200 },
    {
      field: "balance",
      headerName: "Balance",
      width: 200,
      type: "number",
      valueFormatter: (value) => `₹${value}`,
      cellClassName: (params) =>
        params.value < 0
          ? "text-red-600 font-medium"
          : "text-green-600 font-medium",
    },
    {
      field: "moneyTransfer",
      headerName: "Money Transfer",
      width: 120,
      renderCell: (params) => {
        const { merchantId, balance } = params.row;
        const [currentBalance, setCurrentBalance] = useState(balance);

        return (
          <MoneyTransfer
            merchantId={merchantId}
            balance={currentBalance}
            setBalance={setCurrentBalance}
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

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !data?.merchants) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header name="Merchants" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add
          Merchant
        </button>
      </div>
      <DataGrid
        pageSizeOptions={[15, 30, 50, 100]} // Custom page size options
        initialState={{
          pagination: {
            paginationModel: { pageSize: 15 }, // Set default page size to 10
          },
          sorting: {
            sortModel: [{ field: "updatedAt", sort: "desc" }],
          },
        }}
        disableColumnSelector
        rows={data.merchants}
        columns={columns}
        getRowId={(row) => row.merchantId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar
                csvOptions={{
                  fileName: "Merchant data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
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

      <MoneyTransactions />

      <AddMerchantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleAddMerchant}
      />
    </div>
  );
};

export default Merchants;
