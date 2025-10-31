import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Card, IconButton, Input, Spinner } from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewCustomer from "./ViewCustomer";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewCustomerId, setViewCustomerId] = useState(null);

  // ✅ Memoized API call
  const fetchCustomers = useCallback(
    async (pageNumber = page, pageSize = itemsPerPage) => {
      setLoading(true);
      try {
        const res = await api.get("customerslist/", {
          params: { page: pageNumber, page_size: pageSize },
        });

        setCustomers(res.data.results || []);
        setFilteredCustomer(res.data.results);
        setTotalCustomers(res.data.count || 0);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, itemsPerPage]
  );

  useEffect(() => {
    fetchCustomers(page, itemsPerPage);
  }, [fetchCustomers]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        setFilteredCustomer(customers);
      } else {
        const lower = search.toLowerCase();
        setFilteredCustomer(
          customers.filter((c) =>
            [c.full_name, c.gender, c.address]
              .some((v) => v?.toLowerCase().includes(lower))
          )
        );
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, customers]);

  const viewCustomer = (c) => {
    setViewCustomerId(c.id);
    setViewOpen(true);
  };

  const columns = [
    { name: "Name", selector: (row) => row.full_name, sortable: true },
    { name: "DOB", selector: (row) => row.dob, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "Address", selector: (row) => row.address, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <IconButton size="sm" variant="text" onClick={() => viewCustomer(row)}>
          <EyeIcon className="h-5 w-5" />
        </IconButton>
      ),
    },
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
          <div className="flex justify-center py-10 gap-2">
            <Spinner className="h-8 w-8" />
            <span className="ml-2 text-gray-500">Loading customers...</span>
          </div>
        ) : (
          <DataTable
            key={`${page}-${itemsPerPage}`}   // ✅ fixes re-render jump
            columns={columns}
            data={filteredCustomer}
            pagination
            paginationServer
            paginationTotalRows={totalCustomers}
            paginationPerPage={itemsPerPage}  // ✅ required
            paginationDefaultPage={page}
            paginationResetDefaultPage={false} // ✅ important fix
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(size, p) => {
              setItemsPerPage(size);
              setPage(p);
            }}
            highlightOnHover
            responsive
            noDataComponent="No Customer found."
            noHeader
          />
        )}
      </Card>

      {viewOpen && (
        <ViewCustomer
          open={viewOpen}
          handleOpenClose={setViewOpen}
          customerId={viewCustomerId}
        />
      )}
    </div>
  );
}
