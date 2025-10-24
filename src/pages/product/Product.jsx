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
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import AddProduct from "./AddProduct"; // your add modal
import EditProduct from "./EditProduct"; // your edit modal
import ViewProduct from "./ViewProduct"; // your view modal

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewProductId, setViewProductId] = useState(null);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("product/");
      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete Product
  const deleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`products/${selectedProduct.id}/`);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Table Columns
  const columns = [
    {
      name: "Product Name",
      selector: (row) => row.product_name,
      sortable: true,
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
    },
    {
      name: "Price (₹)",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-blue-gray-700">₹{row.price}</span>
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
          {row.stock_quantity > 0 ? `${row.stock_quantity}` : "Out of stock"}
        </span>
      ),
    },
    {
      name: "Availability",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${row.is_available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {row.is_available ? "Available" : "Not Available"}
        </span>
      ),
    },
    {
      name: "Avg. Rating",
      selector: (row) => row.average_rating,
      sortable: true,
      cell: (row) => (
        <span className="text-yellow-600">
          ⭐ {Number(row.average_rating || 0).toFixed(1)}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <IconButton
            size="sm"
            variant="text"
            color="blue"
            onClick={() => {
              setEditProductId(row.id);
              setEditOpen(true);
            }}
          >
            <PencilIcon className="h-5 w-5" />
          </IconButton>

          <IconButton
            size="sm"
            variant="text"
            color="red"
            onClick={() => {
              setSelectedProduct(row);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon className="h-5 w-5" />
          </IconButton>

          <IconButton
            size="sm"
            variant="text"
            color="gray"
            onClick={() => {
              setViewProductId(row.id);
              setViewOpen(true);
            }}
          >
            <EyeIcon className="h-5 w-5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">Product List</h3>
        <Button color="gray" onClick={() => setAddOpen(true)}>
          + Add Product
        </Button>
        <AddProduct
          open={addOpen}
          handleOpenClose={setAddOpen}
          refresh={fetchProducts}
        />
      </div>

      {/* DataTable */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">
              Loading products...
            </span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            pagination
            highlightOnHover
            responsive
            noHeader
          />
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} size="sm" handler={setDeleteDialogOpen}>
        <DialogHeader className="flex justify-center">
          <Typography variant="h5" className="font-semibold">
            Confirm Deletion
          </Typography>
        </DialogHeader>
        <DialogBody  className="text-black text-base">
          Are you sure you want to delete{" "}
          <strong className="text-red-500">{selectedProduct?.product_name}</strong>?
        </DialogBody>
        <DialogFooter  className="flex justify-center gap-4">
          <Button
            variant="text"
            color="secondary"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={deleteProduct}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Modal */}
      {editOpen && (
        <EditProduct
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editProductId}
          productId={editProductId}
          refresh={fetchProducts}
        />
      )}

      {/* View Modal */}
      {viewOpen && (
        <ViewProduct
          open={viewOpen}
          handleOpenClose={setViewOpen}
          productId={viewProductId}
        />
      )}
    </div>
  );
}
