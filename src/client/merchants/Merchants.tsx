import Header from "@/components/header";
import { trpc } from "@/util";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import AddMerchantModal from "./AddMerchantModal";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "phoneNumber", headerName: "Phone Number", width: 200 },
  { field: "location", headerName: "Location", width: 200 },
];

type MerchantFormData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
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
        rows={data.merchants}
        columns={columns}
        getRowId={(row) => row.merchantId}
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
