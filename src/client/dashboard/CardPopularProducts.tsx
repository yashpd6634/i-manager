import { DashboardMetrics } from "@/store/types";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { trpc } from "@/util";
// import Rating from "../(components)/Rating";

const CardPopularProducts = () => {
  const dashboardMetrics = trpc.getDashboardMeterics.useQuery();
  // console.log(trpc.getDashboardMeterics.useQuery());

  useEffect(() => {
    window.appApi.receive("app", (event) => {
      console.log("Received event from main ", event);
      alert("Received event from main " + event.action);
    });
  }, []);

  // useEffect(() => {
  //   const fetchMetrics = async () => {
  //     try {
  //       const data = await ipcRenderer.invoke("getDashboardMetrics");
  //       setDashboardMetrics(data);
  //     } catch (err) {
  //       console.log(err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchMetrics();
  // }, []);

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {false ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Popular Products
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.data?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-3">
                  {/* <Image
                    src={`https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/product${
                      Math.floor(Math.random() * 3) + 1
                    }.png`}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg w-14 h-14"
                  /> */}
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700">
                      {product.name}
                    </div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-xs">
                        ${product.wholesalePrice}
                      </span>
                      {/* <span className="mx-2">|</span> */}
                      {/* <Rating rating={product.rating || 0} /> */}
                    </div>
                  </div>
                </div>

                <div className="text-xs flex items-center">
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  {Math.round(product.currentQuantity / 1000)}k Sold
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
