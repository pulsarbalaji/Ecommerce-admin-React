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
  Chip,
  Typography,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import AddOffer from "./AddOffer";
import EditOffer from "./EditOffer";
import ViewOffer from "./ViewOffer";

export default function Offer() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOffers, setTotalOffers] = useState(0);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOfferId, setViewOfferId] = useState(null);

  // ✅ Fetch offers with pagination
  const fetchOffers = async (pageNumber = page, pageSize = itemsPerPage) => {
    setLoading(true);
    try {
      const response = await api.get("offers/", {
        params: {
          page: pageNumber,
          page_size: pageSize,
        },
      });
      const result = response.data.results;
      setOffers(result.data || []);
      setTotalOffers(response.data.count || 0);
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [page, itemsPerPage]);

  const deleteOffer = async () => {
    if (!selectedOffer) return;
    try {
      await api.delete(`offers/${selectedOffer.id}/`);
      setOffers(offers.filter((o) => o.id !== selectedOffer.id));
      setDeleteDialogOpen(false);
      setSelectedOffer(null);
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  const getStatusChipProps = (status) => ({
    color: status ? "green" : "red",
    text: status ? "Active" : "Inactive",
  });

  const columns = [
    { name: "Category Name", selector: (row) => row.category_name, sortable: true },
    { name: "Product Name", selector: (row) => row.product_name, sortable: true },
    { name: "Offer Name", selector: (row) => row.offer_name, sortable: true },
    { name: "Percentage", selector: (row) => row.offer_percentage, sortable: true },
    {
      name: "Status",
      cell: (row) => {
        const status = getStatusChipProps(row.is_active);
        return <Chip color={status.color} value={status.text} size="sm" />;
      },
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
              setEditOfferId(row.id);
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
              setSelectedOffer(row);
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
              setViewOfferId(row.id);
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
        <h3 className="text-2xl font-bold text-blue-gray-800">Offers List</h3>
        <Button color="gray" onClick={() => setAddOpen(true)}>
          + Add Offer
        </Button>
        <AddOffer open={addOpen} handleOpenClose={setAddOpen} refresh={fetchOffers} />
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">Loading offers...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={offers}
            pagination
            paginationServer
            paginationTotalRows={totalOffers}
            paginationDefaultPage={page}
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(size) => {
              setItemsPerPage(size);
              setPage(1); // reset to first page
            }}
            highlightOnHover
            responsive
            noHeader
          />
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} size="sm" handler={setDeleteDialogOpen}>
        <DialogHeader  className="flex justify-center">
          <Typography variant="h5" className="font-semibold">
            Confirm Deletion
          </Typography>
        </DialogHeader>
        <DialogBody className="text-black text-base">
          Are you sure you want to delete <strong className="text-red-500" >{selectedOffer?.offer_name}</strong>?
        </DialogBody>
        <DialogFooter  className="flex justify-center gap-4">
          <Button variant="text" color="secondary" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={deleteOffer}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Modal */}
      {editOpen && (
        <EditOffer
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editOfferId}
          offerId={editOfferId}
          refresh={fetchOffers}
        />
      )}

      {/* View Modal */}
      {viewOpen && (
        <ViewOffer
          open={viewOpen}
          handleOpenClose={setViewOpen}
          offerId={viewOfferId}
        />
      )}
    </div>
  );
}
