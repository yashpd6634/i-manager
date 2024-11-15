import { useState } from "react";
import { trpc } from "./util";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IpcRequest } from "../api";
import superjson from "superjson";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/dashboard/Dashboard";
import Wrapper from "./wrapper";
import Inventory from "./inventory/Inventory";
import Products from "./products/Products";
import Merchants from "./merchants/Merchants";
import Settings from "./settings/Settings";
import Expenses from "./expenses/Expenses";
import Orders from "./orders/Orders";
import Employees from "./employee/EmployeeDetails";
import MerchantDetails from "./merchantDetails/MerchantDetails";
import OrderDetails from "./orderDetails/OrderDetails";
import Portfolio from "./portfolio/Portfolio";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink(),
        httpBatchLink({
          url: "/trpc",

          // custom fetch implementation that sends the request over IPC to Main process
          fetch: async (input, init) => {
            const req: IpcRequest = {
              url:
                input instanceof URL
                  ? input.toString()
                  : typeof input === "string"
                  ? input
                  : input.url,
              method: input instanceof Request ? input.method : init?.method!,
              headers:
                input instanceof Request ? input.headers : init?.headers!,
              body: input instanceof Request ? input.body : init?.body!,
            };

            const resp = await window.appApi.trpc(req);
            // Since all tRPC really needs is the JSON, and we already have the JSON deserialized,
            // construct a "fake" fetch Response object
            return {
              json: () => Promise.resolve(resp.body),
            };
          },

          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Dashboard />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Dashboard />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/inventory"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Inventory />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/products"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Products />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/orders"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Orders />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <OrderDetails />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/merchants"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Merchants />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/merchants/:merchantId"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <MerchantDetails />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/settings"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Settings />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/expenses"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Expenses />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/employees"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Employees />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Wrapper>
              <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <Portfolio />
                </QueryClientProvider>
              </trpc.Provider>
            </Wrapper>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
