import { trpc } from "@/util";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type ExpenseSums = {
  [category: string]: number;
};

type ExpenseCategory = {
  name: string;
  value: number;
  color: string;
};

const CardExpenseSummary = () => {
  // Fetch the expenses from TRPC query
  const { data: dashboardMetrics, isLoading } =
    trpc.getDashboardMeterics.useQuery();

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  useEffect(() => {
    if (dashboardMetrics) {
      const expenseSummary = dashboardMetrics.expenseSummary || [];

      // Filter and sum the expenses by category
      const expenseSums: ExpenseSums = expenseSummary.reduce(
        (acc: ExpenseSums, item: any) => {
          const category = item.category + " Expenses"; // Add " Expenses" to each category for display
          const amount = parseInt(item.amount.toString(), 10); // Convert amount to number, assuming it's a string
          if (!acc[category]) acc[category] = 0;
          acc[category] += amount;
          return acc;
        },
        {} as ExpenseSums // Initializing the accumulator as an empty object typed as ExpenseSums
      );

      // Color palette for the chart
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

      // Convert to ExpenseCategory type and add colors
      const categories: ExpenseCategory[] = Object.entries(expenseSums).map(
        ([name, value], index) => ({
          name,
          value: value as number, // Ensure it's a number
          color: colorPalette[index % colorPalette.length], // Assign color from palette
        })
      );

      // Set categories and total expenses
      setExpenseCategories(categories);
      setTotalExpenses(
        categories.reduce((acc, category) => acc + category.value, 0)
      );
    }
  }, [dashboardMetrics]);

  const formattedTotalExpenses = totalExpenses.toFixed(2);

  return (
    <div className="row-span-3 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Expense Summary
            </h2>
            <hr />
          </div>
          {/* BODY */}
          <div className="xl:flex justify-between pr-7">
            {/* CHART */}
            <div className="relative basis-3/5">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    innerRadius={50}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-₹{index}`}
                        fill={entry.color} // Use color from category data
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center basis-2/5">
                <span className="font-bold text-xl">
                  ₹{formattedTotalExpenses}
                </span>
              </div>
            </div>
            {/* LABELS */}
            <ul className="flex flex-col justify-around items-center xl:items-start py-5 gap-3">
              {expenseCategories.map((entry, index) => (
                <li
                  key={`legend-₹{index}`}
                  className="flex items-center text-xs"
                >
                  <span
                    className="mr-2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }} // Use color from category data
                  ></span>
                  {entry.name}
                </li>
              ))}
            </ul>
          </div>
          {/* FOOTER */}
          <div>
            <hr />
            {dashboardMetrics?.expenseSummary && (
              <div className="mt-3 flex justify-between items-center px-7 mb-4">
                <div className="pt-2">
                  <p className="text-sm">
                    Average:{" "}
                    <span className="font-semibold">
                      ₹{formattedTotalExpenses}
                    </span>
                  </p>
                </div>
                <span className="flex items-center mt-2">
                  <TrendingUp className="mr-2 text-green-500" />
                  {/* 30% */}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;
