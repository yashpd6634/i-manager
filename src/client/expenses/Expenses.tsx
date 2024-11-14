import { useEffect, useMemo, useState } from "react";
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
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import AddExpenseModal from "./AddExpenseModal";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DateRangePicker } from "react-date-range";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

// Define the ExpenseFormData type directly here
type ExpenseFormData = {
  category: string;
  amount: string;
  expendDate: Date; // Or Date, depending on how you manage the date
  description: string;
};

const columns: GridColDef[] = [
  {
    field: "category",
    headerName: "Category",
    width: 200,
    type: "string",
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 200,
    type: "number",
    valueGetter: (value, row) => `₹${row.amount}`,
  },
  {
    field: "expendDate",
    headerName: "Expense Date",
    width: 200,
    type: "date",
    valueGetter: (value, row) => new Date(row.expendDate),
    valueFormatter: (value) => {
      const date = value as Date;
      return date ? `${dayjs(date).format("DD/MM/YYYY")}` : "";
    },
  },
  {
    field: "description",
    headerName: "Description",
    width: 250,
    type: "string",
  },
];

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateRange, setDateRange] = useState<
    { startDate: Date | undefined; endDate: Date | undefined; key: string }[]
  >([{ startDate: undefined, endDate: undefined, key: "selection" }]);
  const [openFilter, setOpenFilter] = useState(false);
  const [expenseByCategory, setExpenseByCategory] = useState<
    Record<string, { category: string; amount: number }>
  >({});
  const apiRef = useGridApiRef();

  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);

  const { data, isLoading, isError } = trpc.getExpenses.useQuery();
  const mutation = trpc.addExpense.useMutation({
    onSuccess: () => {
      // Reload the page after successfully adding an expense
      window.location.reload();
    },
  });

  const [totalExpenses, setTotalExpenses] = useState(data?.totalExpenses ?? 0);

  const filteredProducts = data?.expenses.filter((expense) => {
    const expendDate = dayjs(expense.expendDate);
    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    return (
      (!startDate || expendDate.isSameOrAfter(startDate, "day")) &&
      (!endDate || expendDate.isSameOrBefore(endDate, "day"))
    );
  });

  const handleAddExpense = (expenseData: ExpenseFormData) => {
    mutation.mutate({
      ...expenseData,
      amount: parseFloat(parseFloat(expenseData.amount).toFixed(2)),
    });
  };

  // Create a unique color for each category
  const colorPalette = [
    "#FF6347",
    "#4682B4",
    "#32CD32",
    "#FFD700",
    "#8A2BE2",
    "#D2691E",
    "#FF1493",
    "#00BFFF",
    "#8B0000",
    "#A52A2A",
  ];

  const categoryData = Object.values(expenseByCategory ?? {}).map(
    (item, index) => ({
      ...item,
      color: colorPalette[index % colorPalette.length], // Cycle through colors
    })
  );

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
    let totalAmount = 0;
    const categoryAmounts: Record<
      string,
      { category: string; amount: number }
    > = {};

    visibleRowIds.forEach((rowId) => {
      const row = apiRef.current.getRow(rowId);
      if (row) {
        totalAmount += row.amount;
        if (!categoryAmounts[row.category]) {
          categoryAmounts[row.category] = { category: row.category, amount: 0 };
        }
        categoryAmounts[row.category].amount += row.amount;
      }
    });

    setTotalExpenses(totalAmount);
    setExpenseByCategory(categoryAmounts);
  };

  const aggregatedData = useMemo(() => categoryData ?? [], [categoryData]);

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
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                fullWidth
                className="my-2"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Rent">Rent</MenuItem>
                <MenuItem value="StaffPayment">Staff Payment</MenuItem>
                <MenuItem value="ElectricityBill">Electricity Bill</MenuItem>
                <MenuItem value="Transportation">Transportation</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="MaintenanceShop">Maintenance - Shop</MenuItem>
                <MenuItem value="MaintenanceSelf">Maintenance - Self</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </div>
            {/* START DATE */}
            <div>
              <TextField
                id="start-date"
                label="Start Date"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={
                  dateRange[0].startDate
                    ? new Date(
                        dateRange[0].startDate.getTime() -
                          dateRange[0].startDate.getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setDateRange((prevRange) => [
                    {
                      ...prevRange[0],
                      startDate: e.target.value
                        ? new Date(
                            new Date(e.target.value).getTime() +
                              new Date().getTimezoneOffset() * 60000
                          )
                        : undefined,
                    },
                  ])
                }
              />
            </div>
            {/* END DATE */}
            <div style={{ marginTop: "16px" }}>
              <TextField
                id="end-date"
                label="End Date"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={
                  dateRange[0].endDate
                    ? new Date(
                        dateRange[0].endDate.getTime() -
                          dateRange[0].endDate.getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setDateRange((prevRange) => [
                    {
                      ...prevRange[0],
                      endDate: e.target.value
                        ? new Date(
                            new Date(e.target.value).getTime() +
                              new Date().getTimezoneOffset() * 60000
                          )
                        : undefined,
                    },
                  ])
                }
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
        <h4>Total Expenses: ₹{totalExpenses}</h4>
      </div>

      {/* Expenses Table */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold px-6 py-4">Expense Details</h3>
        <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
          <DialogTitle>Popup Title</DialogTitle>
          <DialogContent>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={2}
            >
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
          rows={filteredProducts}
          apiRef={apiRef}
          columns={columns}
          getRowId={(row) => row.expenseId} // Assuming each expense has an expenseId
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
                  Show Expense Date Filter
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
                  Reset Expense Date Filter
                </Button>
                <Button
                  onClick={() => {
                    calculateExpenses(apiRef);
                  }}
                  variant="contained"
                  color="warning"
                >
                  Calculate Expenses
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
