import { trpc } from "@/util";
import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardSalesSummary = () => {
  const {
    data: dashboardMetrics,
    isLoading,
    isError,
  } = trpc.getDashboardMeterics.useQuery();

  const salesData =
    dashboardMetrics?.orderSummary.map((order) => ({
      date: order.orderDate,
      totalBill: order.totalBill,
    })) || [];

  const groupedSalesData = salesData.reduce(
    (acc: { date: string; totalBill: number }[], curr) => {
      // Format the date to exclude the time
      const dateKey = new Date(curr.date).toLocaleDateString("en-US");

      // Check if the date already exists in the accumulator
      const existing = acc.find((item) => item.date === dateKey);

      if (existing) {
        // If the date exists, add the totalBill to it
        existing.totalBill += curr.totalBill;
      } else {
        // If the date doesn't exist, add a new entry
        acc.push({ date: dateKey, totalBill: curr.totalBill });
      }

      return acc;
    },
    []
  );

  const [timeframe, setTimeframe] = useState("weekly");

  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalBill, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalBill > curr.totalBill ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

  if (isError) {
    return <div className="m-5">Failed to fetch data</div>;
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Sales Summary
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Value</p>
                <span className="text-2xl font-extrabold">
                  ₹
                  {totalValueSum.toLocaleString("en", {
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-green-500 text-sm ml-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                </span>
              </div>
              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="daily">Daily</option>
                {/* <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option> */}
              </select>
            </div>

            {/* CHART */}
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350} className="px-7">
                <BarChart
                  data={groupedSalesData}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                    tick={{ fontSize: 12, dx: -1 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en")}`
                    }
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                  />
                  <Bar
                    dataKey="totalBill"
                    fill="#3182ce"
                    barSize={10}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">No sales data available</div>
            )}
          </div>

          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center mt-6 text-sm px-7 mb-4">
              <p>{salesData.length || 0} days</p>
              <p className="text-sm">
                Highest Sales Date:{" "}
                <span className="font-bold">{highestValueDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
