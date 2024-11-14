import Header from "@/components/header";
import { trpc } from "@/util";
import { Button, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import CreateEmployeeModal from "./AddEmployeeModal";
import dayjs from "dayjs";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "phoneNumber", headerName: "Phone Number", width: 100 },
  { field: "location", headerName: "Location", width: 200 },
  { field: "role", headerName: "Role", width: 200 },
  {
    field: "joinedDate",
    headerName: "Joined Date",
    width: 150,
    type: "date",
    valueGetter: (value, row) => new Date(row.joinedDate),
    valueFormatter: (value) => {
      const date = value as Date;
      return date ? `${dayjs(date).format("DD/MM/YYYY")}` : ""; // Format the date and time
    },
  },
];

type EmployeeFormData = {
  employeeId: string;
  name: string;
  phoneNumber: string;
  role: string;
  location: string;
  joinedDate: Date;
};

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isError, isLoading } = trpc.getEmployees.useQuery();
  const mutation = trpc.addEmployee.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const handleAddEmployee = (employeeData: EmployeeFormData) => {
    mutation.mutate(employeeData);
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !data?.employees) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header name="Employees" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add
          Employee
        </button>
      </div>
      <DataGrid
        disableColumnSelector
        rows={data.employees}
        columns={columns}
        getRowId={(row) => row.employeeId}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />

      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleAddEmployee}
      />
    </div>
  );
};

export default Employees;
