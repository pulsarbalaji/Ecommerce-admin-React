import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Card, Spinner, IconButton } from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewContact from "./ViewContact"; // modal component

export default function ContactUs() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewContactId, setViewContactId] = useState(null);

  // Fetch contacts
  const fetchContacts = async (pageNumber = page, pageSize = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await api.get("contactus/", {
        params: { page: pageNumber, page_size: pageSize },
      });
      setContacts(res.data.data || []);
      setTotalContacts(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, itemsPerPage]);

  // Actions
  const viewContact = (contact) => {
    setViewContactId(contact.id);
    setViewOpen(true);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <IconButton
          size="sm"
          variant="text"
          color="gray"
          onClick={() => viewContact(row)}
        >
          <EyeIcon className="h-5 w-5" />
        </IconButton>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">
          Contact Us Details
        </h3>
      </div>

      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">
              Loading contact details...
            </span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={contacts}
            pagination
            paginationServer
            paginationTotalRows={totalContacts}
            paginationDefaultPage={page}
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(size) => {
              setItemsPerPage(size);
              setPage(1);
            }}
            highlightOnHover
            responsive
            noHeader
            noDataComponent={
              <div className="text-center py-6">No contact details found.</div>
            }
          />
        )}
      </Card>

      {/* View Contact Modal */}
      {viewOpen && (
        <ViewContact
          open={viewOpen}
          handleOpenClose={setViewOpen}
          contactId={viewContactId}
        />
      )}
    </div>
  );
}
