import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

const getDashboardMetrics = async () => {
  return {
    test: "test",
  };
};

const customBaseQuery: BaseQueryFn<
  { url: string }, // Arguments that the base query receives
  unknown, // Response data type
  unknown // Error type
> = async ({ url }) => {
  try {
    // Handle the custom queries based on the URL
    if (url === "/dashboard") {
      const data = await getDashboardMetrics();
      return { data }; // Return the data
    }

    // Add other custom logic for different endpoints if needed

    return { error: { status: 404, message: "Endpoint not found" } }; // Fallback for unknown endpoints
  } catch (error) {
    return { error: { status: 500, message: "Internal server error" } }; // Return an error if something fails
  }
};

export const api = createApi({
  baseQuery: customBaseQuery, // Use the custom base query
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses"],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => ({ url: "/dashboard" }), // Use the custom URL logic
      providesTags: ["DashboardMetrics"],
    }),
    // The other queries and mutations will need similar custom handling or can be left as is if you don't use them
  }),
});

// export const api = createApi({
//   baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5123" }),
//   reducerPath: "api",
//   tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses"],
//   endpoints: (build) => ({
//     getDashboardMetrics: build.query<DashboardMetrics, void>({
//       query: () => "/dashboard",
//       providesTags: ["DashboardMetrics"],
//     }),
//     getProducts: build.query<Product[], string | void>({
//       query: (search) => ({
//         url: "/products",
//         params: search ? { search } : {},
//       }),
//       providesTags: ["Products"],
//     }),
//     createProduct: build.mutation<Product, NewProduct>({
//       query: (newProduct) => ({
//         url: "/products",
//         method: "POST",
//         body: newProduct,
//       }),
//       invalidatesTags: ["Products"],
//     }),
//     getUsers: build.query<User[], void>({
//       query: () => "/users",
//       providesTags: ["Users"],
//     }),
//     getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
//       query: () => "/expenses",
//       providesTags: ["Expenses"],
//     }),
//   }),
// });

export const {
  useGetDashboardMetricsQuery,
  // useGetProductsQuery,
  // useCreateProductMutation,
  // useGetUsersQuery,
  // useGetExpensesByCategoryQuery,
} = api;
