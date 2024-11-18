import Header from "@/components/header";
import { trpc } from "@/util";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  gridFilteredSortedRowIdsSelector,
  GridToolbar,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useMemo, useState } from "react";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const merchantColumns: GridColDef[] = [
  { field: "merchantId", headerName: "Merchant ID", width: 100 },
  { field: "merchantName", headerName: "Merchant Name", width: 200 },
  { field: "merchantLocation", headerName: "Merchant Location", width: 120 },
  {
    field: "merchantBill",
    headerName: "Merchant Bill",
    width: 150,
    type: "number",
  },
  {
    field: "profitFromMerchant",
    headerName: "Merchant Profit",
    width: 150,
    type: "number",
    cellClassName: (params) =>
      params.row.profitFromMerchant < 0
        ? "text-red-600 font-bold"
        : "text-green-600 font-bold",
  },
];

const Portfolio = () => {
  const {
    data: productData,
    error: productError,
    isLoading: productIsLoading,
    refetch: productRefecth,
  } = trpc.getProducts.useQuery();
  const {
    data: orderData,
    error: orderError,
    isLoading: orderIsLoading,
    refetch: orderRefecth,
  } = trpc.getOrdersWithProduct.useQuery();

  const productApiRef = useGridApiRef();
  const merchantApiRef = useGridApiRef();

  const [dateRange, setDateRange] = useState([
    { startDate: undefined, endDate: undefined, key: "selection" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [totalMerchantBill, setTotalMerchantBill] = useState(0);
  const [totalMerchantProfit, setTotalMerchantProfit] = useState(0);

  const [totalProductBill, setTotalProductBill] = useState(0);
  const [totalProductProfit, setTotalProductProfit] = useState(0);

  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  const handleResetFilter = () => {
    setDateRange([
      { startDate: undefined, endDate: undefined, key: "selection" },
    ]);
  };

  const computedProducts = useMemo(() => {
    if (!productData || !orderData) return [];

    const today = new Date();

    return productData.products.map((product) => {
      // Check if the product is expired
      const isExpired = new Date(product.expiryDate) < today;

      // Calculate loss if expired
      const loss = isExpired
        ? (product.purchasedPrice ?? 0) * product.currentQuantity
        : 0;

      // Filter the ordered products for the current product
      const relatedOrders = orderData.orders.flatMap((order) =>
        order.orderedProducts
          .filter(
            (orderedProduct) => orderedProduct.productId === product.productId
          )
          .map((orderedProduct) => ({
            orderDate: order.orderDate,
            soldPrice: orderedProduct.soldPrice,
            quantity: orderedProduct.quantity,
            merchantId: order.merchant.merchantId,
            merchantName: order.merchant.name,
            merchantLocation: order.merchant.location, // Assuming merchant has a `location` field
            orderedProductPrice:
              (product.purchasedPrice ?? 0) * orderedProduct.quantity,
            orderedProductBill:
              orderedProduct.soldPrice * orderedProduct.quantity,
            profit:
              (orderedProduct.soldPrice - (product.purchasedPrice ?? 0)) *
              orderedProduct.quantity,
          }))
      );

      let expiredQuantity;
      if (isExpired && product.currentQuantity > 0) {
        relatedOrders.push({
          orderDate: product.expiryDate,
          soldPrice: 0,
          quantity: 0,
          merchantId: "",
          merchantName: "",
          merchantLocation: "",
          orderedProductPrice:
            (product.purchasedPrice ?? 0) * product.currentQuantity,
          orderedProductBill: 0,
          profit: -loss,
        });
        expiredQuantity = product.currentQuantity;
      }

      const filteredRelatedOrders = relatedOrders.filter((order) => {
        const orderDate = dayjs(order.orderDate);
        const startDate = dateRange[0].startDate;
        const endDate = dateRange[0].endDate;

        return (
          (!startDate || orderDate.isSameOrAfter(startDate, "day")) &&
          (!endDate || orderDate.isSameOrBefore(endDate, "day"))
        );
      });

      // Calculate total sold quantity and profit for the product
      const totalSoldQuantity = filteredRelatedOrders.reduce(
        (sum, o) => sum + o.quantity,
        0
      );
      const totalProfit = filteredRelatedOrders.reduce(
        (sum, o) => sum + o.profit,
        0
      );
      const totalOrderedProductPrice = filteredRelatedOrders.reduce(
        (sum, o) => sum + o.orderedProductPrice,
        0
      );
      const totalorderedProductBill = filteredRelatedOrders.reduce(
        (sum, o) => sum + o.orderedProductBill,
        0
      );

      return {
        productId: product.productId,
        productName: product.name,
        piecesPerQuantity: product.piecesPerQuantity,
        purchasedPrice: product.purchasedPrice,
        soldQuantity: totalSoldQuantity,
        ordered: filteredRelatedOrders,
        orderedProductBill: totalorderedProductBill,
        orderedProductPrice: totalOrderedProductPrice,
        totalProfitOnProduct: totalProfit,
        expiredQuantity: expiredQuantity ?? 0,
      };
    });
  }, [productData, orderData, dateRange]);

  const productTableData = computedProducts.map(({ ordered, ...rest }) => rest);
  console.log(productTableData);

  const merchantData = useMemo(() => {
    if (!computedProducts) return [];

    // Use a Map to aggregate data by merchantId
    const merchantMap = new Map();

    computedProducts.forEach((product) => {
      product.ordered.forEach((order) => {
        if (order.merchantId) {
          if (!merchantMap.has(order.merchantId)) {
            merchantMap.set(order.merchantId, {
              merchantId: order.merchantId,
              merchantName: order.merchantName,
              merchantLocation: order.merchantLocation,
              merchantBill: 0,
              profitFromMerchant: 0,
            });
          }

          // Update the profit for the merchant
          const merchant = merchantMap.get(order.merchantId);
          merchant.profitFromMerchant += order.profit;
          merchant.merchantBill += order.orderedProductBill;
        }
      });
    });

    // Convert the Map into an array
    return Array.from(merchantMap.values());
  }, [computedProducts]);

  const calculateBill = (
    apiRef: React.MutableRefObject<GridApiCommunity>,
    table: String
  ) => {
    if (
      apiRef.current == null ||
      typeof apiRef.current.getAllRowIds !== "function"
    ) {
      return;
    }

    const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    let totalBill = 0;
    let totalProfit = 0;

    if (table === "merchant") {
      visibleRowIds.forEach((rowId: any) => {
        const row = apiRef.current.getRow(rowId);
        if (row) {
          totalBill += row.merchantBill;
          totalProfit += row.profitFromMerchant;
        }
      });

      setTotalMerchantBill(totalBill);
      setTotalMerchantProfit(totalProfit);
    } else if (table === "product") {
      visibleRowIds.forEach((rowId: any) => {
        const row = apiRef.current.getRow(rowId);
        if (row) {
          totalBill += row.orderedProductBill;
          totalProfit += row.totalProfitOnProduct;
        }
      });

      setTotalProductBill(totalBill);
      setTotalProductProfit(totalProfit);
    }
  };

  const productColumns: GridColDef[] = [
    { field: "productId", headerName: "Product ID", width: 100 },
    { field: "productName", headerName: "Product Name", width: 200 },
    {
      field: "purchasedPrice",
      headerName: "Purchased Price",
      width: 200,
      renderCell: (params) => {
        const [newPrice, setNewPrice] = useState(params.row.purchasedPrice);
        const mutation = trpc.updateProductPrice.useMutation({
          onSuccess: () => {
            productRefecth();
            orderRefecth();
          },
        });

        const handleUpdatePrice = () => {
          console.log("New Purchased Price:", newPrice);
          mutation.mutate({
            productId: params.row.productId,
            amount: newPrice,
          });
        };

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <TextField
              type="number"
              size="small"
              defaultValue={newPrice}
              onBlur={(e) => setNewPrice(Number(e.target.value))}
              InputProps={{
                startAdornment: "₹",
              }}
              style={{ width: "100px" }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleUpdatePrice}
            >
              Add
            </Button>
          </div>
        );
      },
    },
    {
      field: "piecesPerQuantity",
      headerName: "Pieces Per Quantity",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `${row.piecesPerQuantity}`,
    },
    {
      field: "soldQuantity",
      headerName: "Sold Quantity",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `${row.soldQuantity}`,
    },
    {
      field: "expiredQuantity",
      headerName: "Expired Quantity",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `${row.expiredQuantity}`,
    },
    {
      field: "orderedProductBill",
      headerName: "Product Bill",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `₹${row.orderedProductBill}`,
    },
    {
      field: "orderedProductPrice",
      headerName: "Product Price",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `₹${row.orderedProductPrice}`,
    },
    {
      field: "totalProfitOnProduct",
      headerName: "Product Profit",
      width: 120,
      type: "number",
      valueGetter: (value, row) => `₹${row.totalProfitOnProduct}`,
      cellClassName: (params) =>
        params.row.totalProfitOnProduct < 0
          ? "text-red-600 font-bold"
          : "text-green-600 font-bold",
    },
  ];

  if (productIsLoading || orderIsLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (
    productError ||
    !productData?.products ||
    orderError ||
    !orderData?.orders
  ) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Portfolio based on Products" />
      <div className="flex mt-4 text-xl font-bold">
        <h4 className="text-cyan-600">Total Bill: ₹{totalProductBill} | </h4>
        <h4
          className={`${
            totalProductProfit > 0 ? `text-lime-600` : `text-red-600`
          }`}
        >
          Gross {`${totalProductProfit > 0 ? `Profit` : `Loss`}`}: ₹
          {totalProductProfit}
        </h4>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Date Filter</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <DateRangePicker
              ranges={dateRange}
              onChange={handleDateRangeChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        apiRef={productApiRef}
        disableColumnSelector
        rows={productTableData}
        columns={productColumns}
        getRowId={(row) => row.productId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar
                csvOptions={{
                  fileName: "Portfolio based on product data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
              <Button
                onClick={() => setOpenDialog(true)}
                variant="contained"
                color="primary"
              >
                Show Date Filter
              </Button>
              <Button
                onClick={handleResetFilter}
                color="secondary"
                variant="outlined"
              >
                Reset Date Filter
              </Button>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        onStateChange={() => calculateBill(productApiRef, "product")}
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
      <Header name="Portfolio based on Merchants" />
      <div className="flex mt-4 text-xl font-bold">
        <h4 className="text-cyan-600">Total Bill: ₹{totalMerchantBill} | </h4>
        <h4
          className={`${
            totalMerchantProfit > 0 ? `text-lime-600` : `text-red-600`
          }`}
        >
          Gross {`${totalMerchantProfit > 0 ? `Profit` : `Loss`}`}: ₹
          {totalMerchantProfit}
        </h4>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Date Filter</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <DateRangePicker
              ranges={dateRange}
              onChange={handleDateRangeChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        apiRef={merchantApiRef}
        disableColumnSelector
        rows={merchantData}
        columns={merchantColumns}
        getRowId={(row) => row.merchantId}
        slots={{
          toolbar: () => (
            <Box display="flex" gap={2} alignItems="center" padding={1}>
              <GridToolbarQuickFilter />
              <GridToolbar
                csvOptions={{
                  fileName: "Portfolio based on merchant data",
                  delimiter: ",",
                  utf8WithBom: true, // Ensures proper encoding for ₹ symbol
                }}
              />
              <Button
                onClick={() => setOpenDialog(true)}
                variant="contained"
                color="primary"
              >
                Show Date Filter
              </Button>
              <Button
                onClick={handleResetFilter}
                color="secondary"
                variant="outlined"
              >
                Reset Date Filter
              </Button>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        onStateChange={() => calculateBill(merchantApiRef, "merchant")}
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Portfolio;
