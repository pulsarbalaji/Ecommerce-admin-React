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
import { PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import ViewCategory from "./ViewCategory";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCategoryId, setViewCategoryId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("categories/");
      const data = response.data.data || [];
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔍 Handle Search Filtering
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCategories(categories);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredCategories(
      categories.filter((cat) =>
        cat.category_name?.toLowerCase().includes(lower)
      )
    );
  }, [search, categories]);

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    const toastId = toast.loading("Deleting category...");
    try {
      const res = await api.delete(`categories/${selectedCategory.id}/`);
      if (res.data?.status === true || res.status === 200) {
        toast.success(res.data?.message || "Category deleted successfully!", { id: toastId });
        setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        throw new Error(res.data?.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.dismiss(toastId);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete category. Please try again.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const columns = [
    { name: "Category Name", selector: (row) => row.category_name, sortable: true },
    {
      name: "Category Image",
      selector: (row) => row.category_image,
      sortable: true,
      cell: (row) => (
        <img
          src={
            row.category_image
              ? row.category_image.startsWith("http")
                ? row.category_image
                : `${backendBaseUrl}${row.category_image}`
              : "/img/No-image.jpg"
          }
          alt={row.category_name || "Category"}
          className="h-10 w-10 rounded object-cover"
        />
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
              setEditCategoryId(row.id);
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
              setSelectedCategory(row);
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
              setViewCategoryId(row.id);
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
        <h3 className="text-2xl font-bold text-blue-gray-800">Category List</h3>
        <div className="flex items-center gap-10">
          <div className="w-2/4">
            <Input
              color="gray"
              label="Search category..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button color="gray" onClick={() => setAddOpen(true)}>
            + Add Category
          </Button>
        </div>
        <AddCategory open={addOpen} handleOpenClose={setAddOpen} refresh={fetchCategories} />
      </div>

      {/* DataTable */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">Loading categories...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
            pagination
            highlightOnHover
            responsive
            noHeader
            noDataComponent="No categories found."
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
        <DialogBody className="text-black text-base">
          Are you sure you want to delete{" "}
          <strong className="text-red-500">{selectedCategory?.category_name}</strong>?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="text" color="blue-gray" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={deleteCategory}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Modal */}
      {editOpen && (
        <EditCategory
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editCategoryId}
          categoryId={editCategoryId}
          refresh={fetchCategories}
        />
      )}

      {/* View Modal */}
      {viewOpen && (
        <ViewCategory open={viewOpen} handleOpenClose={setViewOpen} categoryId={viewCategoryId} />
      )}
    </div>
  );
}
