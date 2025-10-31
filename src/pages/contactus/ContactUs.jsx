import React, { useEffect, useState, useCallback, useRef } from "react";
import DataTable from "react-data-table-component";
import { Card, Spinner, IconButton, Input } from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewContact from "./ViewContact";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function ContactUs() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewContactId, setViewContactId] = useState(null);

  const isFetching = useRef(false);

  const fetchContacts = useCallback(
    async (pageNumber = 1, pageSize = 10) => {
      if (isFetching.current) return;
      isFetching.current = true;

      setLoading(true);
      try {
        const res = await api.get("contactus/", {
          params: { page: pageNumber, page_size: pageSize },
        });

        const results = res.data.data || [];
        setContacts(results);
        setFilteredContacts(results);

        // ✅ use total_items from backend response
        setTotalContacts(res.data.total_items ?? 0);

      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoading(false);
        setTimeout(() => (isFetching.current = false), 200);
      }
    },
    []
  );

  useEffect(() => {
    fetchContacts(page, itemsPerPage);
  }, [fetchContacts, page, itemsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setFilteredContacts(contacts);
      } else {
        const lower = search.toLowerCase();
        setFilteredContacts(
          contacts.filter((cat) =>
            [cat.name, cat.email, cat.phone]
              .some((f) => f?.toLowerCase().includes(lower))
          )
        );
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, contacts]);

  const viewContact = (contact) => {
    setViewContactId(contact.id);
    setViewOpen(true);
  };

  const columns = [
    { name: "Name", selector: r => r.name },
    { name: "Email", selector: r => r.email },
    { name: "Phone", selector: r => r.phone },
    {
      name: "Actions",
      cell: (row) => (
        <IconButton size="sm" variant="text" onClick={() => viewContact(row)}>
          <EyeIcon className="h-5 w-5" />
        </IconButton>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">Customers</h3>
        <div className="w-full sm:w-64 sm:ml-auto">
          <Input
            color="gray"
            label="Search customer..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : (
          <DataTable
            key={`${page}-${itemsPerPage}`}
            columns={columns}
            data={filteredContacts}
            pagination
            paginationServer
            paginationTotalRows={totalContacts}
            paginationPerPage={itemsPerPage}
            paginationDefaultPage={page}
            paginationResetDefaultPage={false}
            onChangePage={(newPage) => newPage !== page && setPage(newPage)}
            onChangeRowsPerPage={(newPerPage, newPage) => {
              setItemsPerPage(newPerPage);
              setPage(newPage);
            }}
            highlightOnHover
            responsive
            noHeader
          />
        )}
      </Card>

      {viewOpen && (
        <ViewContact open={viewOpen} handleOpenClose={setViewOpen} contactId={viewContactId}/>
      )}
    </div>
  );
}
