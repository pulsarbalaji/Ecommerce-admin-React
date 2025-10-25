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
import AddCategory from "./AddCategory"; // your add modal
import EditCategory from "./EditCategory"; // your edit modal
import ViewCategory from "./ViewCategory"; // your view modal

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCategoryId, setViewCategoryId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("categories/");
      setCategories(response.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

const deleteCategory = async () => {
  if (!selectedCategory) return;

  try {
    const res = await api.delete(`categories/${selectedCategory.id}/`);

    // ✅ Show success toast
    toast.success(res.data?.message || "Category deleted successfully!");

    // Update local state
    setCategories(categories.filter(c => c.id !== selectedCategory.id));
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  } catch (err) {
    console.error("Error deleting category:", err);

    // ✅ Detailed backend error handling
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.detail ||
      "Failed to delete category. Please try again.";

    toast.error(errorMessage);
  }
};

  const columns = [
    { name: "Category Name", selector: row => row.category_name, sortable: true },
    {
      name: "Category Image",
      selector: row => row.category_image,
      sortable: true,
      cell: row => (
        <img
          src={
            row.category_image
              ? row.category_image.startsWith("http")
                ? row.category_image
                : `${backendBaseUrl}${row.category_image}`
              : "/img/No-image.jpg" // fallback image
          }
          alt={row.category_name || "Category"}
          className="h-10 w-10 rounded object-cover"
        />
      ),

},
{
  name: "Actions",
    cell: row => (
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
      <Button color="gray" onClick={() => setAddOpen(true)}>
        + Add Category
      </Button>
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
          data={categories}
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
      <DialogBody className="text-black text-base">
        Are you sure you want to delete <strong className="text-red-500" >{selectedCategory?.category_name}</strong>?
      </DialogBody>
      <DialogFooter className="flex justify-center gap-4">
        <Button variant="text" color="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button color="red" onClick={deleteCategory}>Delete</Button>
      </DialogFooter>
    </Dialog>

    {/* Edit Modal */}
    {editOpen && (
      <EditCategory
        open={editOpen}
        handleOpenClose={setEditOpen}
        key={editCategoryId}
        categoryId={editCategoryId}
        refresh={fetchCategories} // refresh after edit
      />
    )}

    {/* View Modal */}
    {viewOpen && (
      <ViewCategory
        open={viewOpen}
        handleOpenClose={setViewOpen}
        categoryId={viewCategoryId}
      />
    )}
  </div>
);
}
