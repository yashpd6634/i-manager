import { DashboardMetrics } from "@/store/types";
import { ShoppingBag, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { trpc } from "@/util";
import { Rating } from "@mui/material";
// import Rating from "../(components)/Rating";

const CardMerchantSummary = () => {
  const {
    data: dashboardMetrics,
    isLoading,
    isError,
  } = trpc.getDashboardMeterics.useQuery();

  useEffect(() => {
    window.appApi.receive("app", (event) => {
      console.log("Received event from main ", event);
      alert("Received event from main " + event.action);
    });
  }, []);

  if (isError) {
    return <div className="m-5">Failed to fetch data</div>;
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Top Merchants
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.merchantSummary.map((merchant) => (
              <div
                key={merchant.merchantId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-3">
                  {/* <Image
                    src={`https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/product₹{
                      Math.floor(Math.random() * 3) + 1
                    }.png`}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg w-14 h-14"
                  /> */}
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700">
                      {merchant.name}
                    </div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-xs">
                        ₹{merchant.totalBilled}
                      </span>
                      <span className="mx-2">|</span>
                      <span>{`${merchant.location}`}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs flex items-center font-medium ${
                    merchant.balance > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <Wallet className="w-4 h-4" />
                  </button>
                  ₹{merchant.balance} Balance
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardMerchantSummary;
