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
  Chip,
} from "@material-tailwind/react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import AddOffer from "./AddOffer";
import EditOffer from "./EditOffer";
import ViewOffer from "./ViewOffer";

export default function Offer() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [viewOfferId, setViewOfferId] = useState(null);

  // ✅ Fetch all offers
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get("offers/");
      const data =
        res.data?.results?.data?.data ||
        res.data?.results?.data ||
        res.data?.data ||
        [];
      setOffers(data);
      setFilteredOffers(data);
    } catch (err) {
      console.error("Error fetching offers:", err);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // ✅ Live client-side search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOffers(offers);
      return;
    }

    const lower = search.toLowerCase();

    setFilteredOffers(
      offers.filter((o) => {
        const discountMatch = String(o.offer_percentage || "")
          .toLowerCase()
          .includes(lower);
        const statusMatch = o.is_active
          ? "active".includes(lower)
          : "inactive".includes(lower);

        return (
          o.offer_name?.toLowerCase().includes(lower) ||
          o.product_name?.toLowerCase().includes(lower) ||
          o.category_name?.toLowerCase().includes(lower) ||
          discountMatch ||
          statusMatch
        );
      })
    );
  }, [search, offers]);

  // ✅ Delete offer
  const deleteOffer = async () => {
    if (!selectedOffer) return;
    const toastId = toast.loading("Deleting offer...");
    try {
      const res = await api.delete(`offers/${selectedOffer.id}/`);
      if (res.data?.status === true || res.data?.message) {
        setOffers((prev) => prev.filter((o) => o.id !== selectedOffer.id));
        setDeleteDialogOpen(false);
        setSelectedOffer(null);
        toast.success(res.data?.message || "Offer deleted successfully!", {
          id: toastId,
        });
      } else {
        throw new Error(res.data?.message || "Failed to delete offer.");
      }
    } catch (err) {
      console.error("Delete Offer Error:", err);
      toast.dismiss(toastId);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while deleting offer.",
        { id: toastId }
      );
    }
  };

  // ✅ Table columns
  const columns = [
    {
      name: "Category",
      selector: (row) => row.category_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Product",
      selector: (row) => row.product_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Offer Name",
      selector: (row) => row.offer_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Discount (%)",
      selector: (row) => row.offer_percentage,
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-green-700">
          {row.offer_percentage}%
        </span>
      ),
    },
    {
      name: "Start Date",
      selector: (row) => row.start_date,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => row.end_date,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.is_active ? "Active" : "Inactive"),
      sortable: true,
      cell: (row) => (
        <Chip
          color={row.is_active ? "green" : "red"}
          value={row.is_active ? "Active" : "Inactive"}
          size="sm"
        />
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 justify-center">
          <IconButton
            size="sm"
            variant="text"
            color="blue"
            onClick={() => {
              setEditOfferId(row.id);
              setEditOpen(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </IconButton>

          <IconButton
            size="sm"
            variant="text"
            color="red"
            onClick={() => {
              setSelectedOffer(row);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </IconButton>

          <IconButton
            size="sm"
            variant="text"
            color="gray"
            onClick={() => {
              setViewOfferId(row.id);
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
          Offers List
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <Input
              color="gray"
              label="Search offers..."
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
            + Add Offer
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center py-10 gap-2">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="text-blue-gray-400">Loading offers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredOffers}
              pagination
              highlightOnHover
              responsive
              noDataComponent="No offers found."
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
          <strong className="text-red-500">{selectedOffer?.offer_name}</strong>?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={deleteOffer}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modals */}
      {addOpen && (
        <AddOffer
          open={addOpen}
          handleOpenClose={setAddOpen}
          refresh={fetchOffers}
        />
      )}
      {editOpen && (
        <EditOffer
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editOfferId}
          offerId={editOfferId}
          refresh={fetchOffers}
        />
      )}
      <ViewOffer
        open={viewOpen}
        handleOpenClose={setViewOpen}
        offerId={viewOfferId}
      />
    </div>
  );
}
