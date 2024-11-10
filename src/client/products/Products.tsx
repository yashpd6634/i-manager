import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CreateProductModal from "./CreateProductModal";
import { trpc } from "@/util";
import Header from "@/components/header";

type ProductFormData = {
  productId: string;
  name: string;
  wholesalePrice: string;
  retailPrice: string;
  purchasedQuantity: number;
  expiryDate: Date;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = trpc.getProducts.useQuery(searchTerm);
  const mutation = trpc.createProduct.useMutation({
    onSuccess: () => {
      // Reload the page after successfully creating a product
      window.location.reload();
    },
  });

  const handleCreateProduct = (productData: ProductFormData) => {
    mutation.mutate({
      ...productData,
      wholesalePrice: parseFloat(
        parseFloat(productData.wholesalePrice).toFixed(2)
      ),
      retailPrice: parseFloat(parseFloat(productData.retailPrice).toFixed(2)),
    });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [data]);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !data?.products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            ref={inputRef}
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Product
        </button>
      </div>

      {/* BODY PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between">
        {false ? (
          <div>Loading...</div>
        ) : (
          data.products?.map((product) => (
            <div
              key={product.productId}
              className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
            >
              <div className="flex flex-col items-center">
                <img
                  src="../assets/PM_TradeWorld_Flex.jpeg"
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mb-3 rounded-2xl w-36 h-36"
                />
                <h3 className="text-lg text-gray-900 font-semibold">
                  {product.name}
                </h3>
                <p className="text-gray-800">
                  Wholsale Price: ₹{product.wholesalePrice.toFixed(2)}
                </p>
                <p className="text-gray-800">
                  Retail Price: ₹{product.retailPrice.toFixed(2)}
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  Stock: {product.currentQuantity}
                </div>
                {/* {product.rating && (
                  <div className="flex items-center mt-2">
                    <Rating rating={product.rating} />
                  </div>
                )} */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;
