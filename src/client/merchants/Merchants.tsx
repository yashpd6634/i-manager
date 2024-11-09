import Header from "@/components/header";
import { trpc } from "@/util";
import { Button, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import AddMerchantModal from "./AddMerchantModal";

const AddMoney = ({
  merchantId,
  balance,
  setBalance,
}: {
  merchantId: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [amount, setAmount] = useState<number | string>("");

  const mutation = trpc.addMoneyToBalance.useMutation({
    onSuccess: () => {
      // Optionally reload data or update state after successful mutation
      setBalance(balance + Number(amount)); // Update the balance locally after adding money
      window.location.reload();
    },
  });

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleAddMoney = () => {
    const addAmount = Number(amount);

    if (!addAmount) {
      alert("Please enter a valid amount to add.");
      return;
    }

    console.log(`Adding ₹${addAmount} to merchant ${merchantId}`);

    // Call the mutation to add money to the merchant's balance
    mutation.mutate({
      merchantId,
      amount: addAmount,
    });

    setAmount(""); // Reset the input after the transaction
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
        label="Amount"
        value={amount}
        onChange={handleAmountChange}
        variant="outlined"
      />
      <Button
        onClick={handleAddMoney}
        variant="contained"
        color="primary"
        style={{ fontSize: "0.65rem" }}
      >
        Add Money
      </Button>
    </div>
  );
};

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "phoneNumber", headerName: "Phone Number", width: 100 },
  { field: "location", headerName: "Location", width: 200 },
  { field: "balance", headerName: "Balance", width: 200 },
  {
    field: "addMoney",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => {
      const { merchantId, balance } = params.row;
      const [currentBalance, setCurrentBalance] = useState(balance);

      return (
        <AddMoney
          merchantId={merchantId}
          balance={currentBalance}
          setBalance={setCurrentBalance}
        />
      );
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

type MerchantFormData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
  balance: number;
};

const Merchants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        disableColumnSelector
        rows={data.merchants}
        columns={columns}
        getRowId={(row) => row.merchantId}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />

      <AddMerchantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleAddMerchant}
      />
    </div>
  );
};

export default Merchants;
