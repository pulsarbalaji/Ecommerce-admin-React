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

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [viewCategoryId, setViewCategoryId] = useState(null);

  const backendBaseUrl = import.meta.env.VITE_API_URL;

  // Fetch categories
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

  // 🔍 Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setFilteredCategories(categories);
      } else {
        const lower = search.toLowerCase();
        setFilteredCategories(
          categories.filter((cat) =>
            cat.category_name?.toLowerCase().includes(lower)
          )
        );
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, categories]);

  // 🗑 Delete Category
  const deleteCategory = async () => {
    if (!selectedCategory) return;

    const toastId = toast.loading("Deleting category...");
    try {
      const res = await api.delete(`categories/${selectedCategory.id}/`);
      if (res.data?.status === true || res.status === 200) {
        toast.success(res.data?.message || "Category deleted successfully!", {
          id: toastId,
        });
        setCategories((prev) =>
          prev.filter((c) => c.id !== selectedCategory.id)
        );
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        throw new Error(res.data?.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category.", { id: toastId });
    }
  };

  // 📊 Table Columns
  const columns = [
    {
      name: "Category Name",
      selector: (row) => row.category_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category Image",
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
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2 justify-center">
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
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-blue-gray-800">
          Category List
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <Input
              color="gray"
              label="Search category..."
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
            + Add Category
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="text-blue-gray-400">Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredCategories}
              pagination
              highlightOnHover
              responsive
              noDataComponent="No categories found."
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
          <strong className="text-red-500">
            {selectedCategory?.category_name}
          </strong>
          ?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={deleteCategory}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modals */}
      {addOpen && (
        <AddCategory
          open={addOpen}
          handleOpenClose={setAddOpen}
          refresh={fetchCategories}
        />
      )}
      {editOpen && (
        <EditCategory
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editCategoryId}
          categoryId={editCategoryId}
          refresh={fetchCategories}
        />
      )}
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
