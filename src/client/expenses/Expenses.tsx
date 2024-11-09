import { useMemo, useState } from "react";
import Header from "@/components/header";
import { trpc } from "@/util";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { PlusCircleIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import AddExpenseModal from "./AddExpenseModal";

// Define the ExpenseFormData type directly here
type ExpenseFormData = {
  category: string;
  amount: string;
  expendDate: Date; // Or Date, depending on how you manage the date
  description: string;
};

const columns: GridColDef[] = [
  { field: "category", headerName: "Category", width: 200 },
  { field: "amount", headerName: "Amount", width: 200 },
  { field: "expendDate", headerName: "Expense Date", width: 200 },
  { field: "description", headerName: "Description", width: 250 },
];

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = trpc.getExpenses.useQuery();
  const mutation = trpc.addExpense.useMutation({
    onSuccess: () => {
      // Reload the page after successfully adding an expense
      window.location.reload();
    },
  });

  const handleAddExpense = (expenseData: ExpenseFormData) => {
    mutation.mutate({
      ...expenseData,
      amount: parseFloat(parseFloat(expenseData.amount).toFixed(2)),
    });
  };

  const expenses = useMemo(() => data?.expenses ?? [], [data]);
  const aggregatedData = useMemo(() => data?.expenseByCategory ?? [], [data]);
  const totalExpenses = data?.totalExpenses ?? 0;

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expendDate);
      const matchesCategory =
        selectedCategory === "All" || expense.category === selectedCategory;
      const matchesDate =
        (!startDate || new Date(startDate) <= expenseDate) &&
        (!endDate || new Date(endDate) >= expenseDate);
      return matchesCategory && matchesDate;
    });
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  if (isLoading) return <div className="py-4">Loading...</div>;

  if (isError || !data)
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch expenses
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header name="Expenses" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add Expense
        </button>
      </div>

      {/* Filter and Pie Chart */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Filter by Category and Date
          </h3>
          <div className="space-y-4">
            {/* CATEGORY */}
            <div>
              <label htmlFor="category" className={classNames.label}>
                Category
              </label>
              <select
                id="category"
                name="category"
                className={classNames.selectInput}
                defaultValue="All"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All</option>
                <option>Office</option>
                <option>Professional</option>
                <option>Salaries</option>
              </select>
            </div>
            {/* START DATE */}
            <div>
              <label htmlFor="start-date" className={classNames.label}>
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className={classNames.selectInput}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* END DATE */}
            <div>
              <label htmlFor="end-date" className={classNames.label}>
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className={classNames.selectInput}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Pie Chart */}
        <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                label
                outerRadius={150}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {aggregatedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === activeIndex ? "rgb(29, 78, 216)" : entry.color
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: "20px" }}
                layout="horizontal"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 text-xl font-bold text-red-500">
        <h4>Total Expense: ₹{totalExpenses}</h4>
      </div>

      {/* Expenses Table */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold px-6 py-4">Expense Details</h3>
        <DataGrid
          disableColumnSelector
          rows={filteredExpenses}
          columns={columns}
          getRowId={(row) => row.expenseId} // Assuming each expense has an expenseId
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          checkboxSelection
          className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
        />
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExpense}
      />
    </div>
  );
};

export default Expenses;
