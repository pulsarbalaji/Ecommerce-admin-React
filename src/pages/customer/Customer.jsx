import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Card, IconButton, Input, Spinner } from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewCustomer from "./ViewCustomer"; // Modal for viewing customer details
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

  // Fetch customers with pagination
  const fetchCustomers = async (pageNumber = page, pageSize = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await api.get("customerslist/", {
        params: {
          page: pageNumber,
          page_size: pageSize,
        },
      });
      setCustomers(res.data.results || []);
      setFilteredCustomer(res.data.results);

      setTotalCustomers(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, itemsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setFilteredCustomer(customers);
      } else {
        const lower = search.toLowerCase();
        setFilteredCustomer(
          customers.filter((cat) =>
            cat.full_name?.toLowerCase().includes(lower)||
            cat.gender?.toLowerCase().includes(lower)||
            cat.address?.toLowerCase().includes(lower)
          )
        );
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, customers]);
  // Actions
  const viewCustomer = (customer) => {
    setViewCustomerId(customer.id);
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
        <div className="flex gap-2">
          <IconButton
            size="sm"
            variant="text"
            color="gray"
            onClick={() => viewCustomer(row)}
          >
            <EyeIcon className="h-5 w-5" />
          </IconButton>
        </div>
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
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">Loading customers...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCustomer}
            pagination
            paginationServer
            paginationTotalRows={totalCustomers}
            paginationDefaultPage={page}
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(size) => {
              setItemsPerPage(size);
              setPage(1);
            }}
            highlightOnHover
            responsive
            noHeader
          />
        )}
      </Card>

      {/* View Customer Modal */}
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
