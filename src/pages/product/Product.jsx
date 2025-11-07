import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  IconButton,
  Button,
  Card,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Spinner,
  Typography,
  Input,
} from "@material-tailwind/react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ViewProduct from "./ViewProduct";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [viewProductId, setViewProductId] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProducts, setTotalCustomers] = useState(0);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  // Fetch products
  const fetchProducts = async (pageNumber = page, pageSize = itemsPerPage) => {
    setLoading(true);
    try {
      const response = await api.get("product/", {
        params: { page: pageNumber, page_size: pageSize },
      });
      // Normalized to your backend: results.data.data or results.data
      const data =
        response.data?.results?.data?.data ||
        response.data?.results?.data ||
        response.data?.data ||
        [];

      // ✅ Clean & set products safely
      const cleanData = (Array.isArray(data) ? data : []).filter(
        (item) => item && item.id
      );
      setProducts(cleanData);
      setFilteredProducts(cleanData);


      // ✅ Extract total count properly
      const total =
        response.data?.results?.total ||
        response.data?.total ||
        response.data?.count ||
        data.length;

      setTotalCustomers(total); // must be a NUMBER

    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, itemsPerPage]);

  // Live client-side filtering (like AdminUser)
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          p.product_name?.toLowerCase().includes(lower) ||
          p.category_name?.toLowerCase().includes(lower) ||
          String(p.price).toLowerCase().includes(lower)
      )
    );
  }, [search, products]);

  // Actions
  const deleteProduct = async () => {
    if (!selectedProduct) return;
    const toastId = toast.loading("Deleting product...");
    try {
      const res = await api.delete(`product/${selectedProduct.id}/`);
      if (res.data?.status === true || res.data?.message) {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        toast.success(res.data?.message || "Product deleted successfully!", {
          id: toastId,
        });
      } else {
        throw new Error(res.data?.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.dismiss(toastId);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while deleting product.";
      toast.error(msg, { id: toastId });
    }
  };

  // Table columns—same layout logic as AdminUser, but with product fields
  const columns = [
    {
      name: "Category Name",
      selector: (row) => row.category_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Product Name",
      selector: (row) => row.product_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Product Image",
      cell: (row) => (
        <img
          src={
            row.product_image?.startsWith("http")
              ? row.product_image
              : `${backendBaseUrl}${row.product_image}`
          }
          alt={row.product_name || "Product"}
          className="h-10 w-10 rounded object-cover"
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => <span className="font-semibold">₹{row.price}</span>,
    },
    {
      name: "Quantity",
      selector: (row) => `${row.quantity} ${row.quantity_unit}`,
      sortable: true,
      cell: (row) => (
        <span className="font-medium">
          {row.quantity} {row.quantity_unit}
        </span>
      ),
    },

    {
      name: "Stock",
      selector: (row) => row.stock_quantity,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${row.stock_quantity > 0
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-700"
            }`}
        >
          {row.stock_quantity > 0 ? row.stock_quantity : "Out of stock"}
        </span>
      ),
    },
    {
      name: "Availability",
      selector: (row) => row.is_available ? "Yes" : "No",
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${row.is_available
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {row.is_available ? "Available" : "Not Avaialable"}
        </span>
      ),
    },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center items-center gap-2">

          <IconButton
            size="sm"
            variant="text"
            color="blue"
            className="!p-1.5"
            onClick={() => {
              setEditProductId(row.id);
              setEditOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant="text"
            color="red"
            className="!p-1.5"
            onClick={() => {
              setSelectedProduct(row);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant="text"
            color="gray"
            className="!p-1.5"
            onClick={() => {
              setViewProductId(row.id);
              setViewOpen(true);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-blue-gray-800">
          Product List
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <Input
              color="gray"
              label="Search products..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            color="gray"
            className="w-full sm:w-auto"
            onClick={() => setAddOpen(true)}
          >
            + Add Product
          </Button>
        </div>
      </div>
      {/* DataTable */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="text-blue-gray-400">Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              key={`${page}-${itemsPerPage}`}
              columns={columns}
              data={filteredProducts}
              pagination
              paginationServer
              paginationTotalRows={totalProducts}
              paginationPerPage={itemsPerPage}  // ✅ required
              paginationDefaultPage={page}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(size, p) => {
                setItemsPerPage(size);
                setPage(p);
              }}
              highlightOnHover
              responsive
              noDataComponent="No Product found."
              noHeader
            />
          </div>
        )}
      </Card>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} size="sm" handler={setDeleteDialogOpen}>
        <DialogHeader className="flex justify-center">
          <Typography variant="h5" className="font-semibold">
            Confirm Deletion
          </Typography>
        </DialogHeader>
        <DialogBody className="text-black text-base">
          Are you sure you want to delete{" "}
          <strong className="text-red-500">{selectedProduct?.product_name}</strong>?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={deleteProduct}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
      {/* Modals */}
      {addOpen && (
        <AddProduct open={addOpen} handleOpenClose={setAddOpen} refresh={fetchProducts} />
      )}
      {editOpen && (
        <EditProduct
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editProductId}
          productId={editProductId}
          refresh={fetchProducts}
        />
      )}
      <ViewProduct
        open={viewOpen}
        handleOpenClose={setViewOpen}
        productId={viewProductId}
      />
    </div>
  );
}
