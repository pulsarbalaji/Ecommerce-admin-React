import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import {
  IconButton,
  Card,
  Spinner,
  Chip,
  Input,
} from "@material-tailwind/react";
import { EyeIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewOrder from "./ViewOrder";
import OrderUpdate from "./OrderUpdate";
import { PrinterIcon } from "@heroicons/react/24/solid";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const [search, setSearch] = useState(""); // 🌍 global search text
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateOrderId, setUpdateOrderId] = useState(null);

  // ✅ prevents double-calls during StrictMode and async overlaps
  const activeFetch = useRef(null);

  const orderStatusColor = {
    pending: "yellow",
    order_confirmed: "blue",
    shipped: "blue",
    delivered: "green",
    cancelled: "red",
    returned: "red",
  };

  const paymentStatusColor = {
    pending: "yellow",
    success: "green",
    failed: "red",
    refunded: "blue",
  };

  const formatStatus = (status) =>
    status
      ? status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      : "";

  // ✅ Fetch normal paginated orders
  const fetchOrders = useCallback(
    async (pageNumber = 1, pageSize = 10) => {
      const fetchId = Symbol("fetchId");
      activeFetch.current = fetchId;

      setLoading(true);
      try {
        const res = await api.get("orderdetails/", {
          params: { page: pageNumber, page_size: pageSize },
        });

        if (activeFetch.current !== fetchId) return;

        const results = res.data?.results || [];
        const total = res.data?.total_count || 0;
        const currentPage = res.data?.current_page || 1;
        const size = res.data?.page_size || pageSize;

        setOrders(results);
        setTotalOrders(total);
        setPage(currentPage);
        setItemsPerPage(size);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        if (activeFetch.current === fetchId) setLoading(false);
      }
    },
    []
  );



  // ✅ Fetch global search results
  const fetchGlobalSearch = useCallback(
    async (searchQuery) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setIsGlobalSearch(false);
        fetchOrders(1, itemsPerPage);
        return;
      }

      setIsGlobalSearch(true);

      const fetchId = Symbol("fetchId");
      activeFetch.current = fetchId;
      setLoading(true);

      try {
        const res = await api.get("orders/search/", {
          params: { search: trimmed },
        });

        if (activeFetch.current !== fetchId) return; // ignore outdated calls

        const results = res.data?.data || [];
        setOrders(results);
        setTotalOrders(results.length);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        if (activeFetch.current === fetchId) setLoading(false);
      }
    },
    [fetchOrders, itemsPerPage]
  );

  const printSingle = async (id) => {
    const res = await api.post(
      "single-orders/print-address/",
      { order_id: id },
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "single_address.pdf");
    document.body.appendChild(link);
    link.click();
  };

  // ✅ Only fetch once per mount or pagination update
  useEffect(() => {
    if (!isGlobalSearch) {
      fetchOrders(page, itemsPerPage);
    }
  }, [fetchOrders, itemsPerPage, isGlobalSearch]);



  // ✅ Debounced search — runs only when search changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGlobalSearch(search);
    }, 600);
    return () => clearTimeout(handler);
  }, [search, fetchGlobalSearch]);

  const viewOrder = (order) => {
    setViewOrderId(order.id);
    setViewOpen(true);
  };

  const updateStatus = (order) => {
    setUpdateOrderId(order.id);
    setUpdateOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        name: "Order Number",
        selector: (row) => row.order_number,
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        cell: (row) => (
          <Chip
            color={orderStatusColor[row.status] || "gray"}
            value={formatStatus(row.status)}
            size="sm"
          />
        ),
      },
      {
        name: "Payment Status",
        selector: (row) => row.payment_status,
        sortable: true,
        cell: (row) => (
          <Chip
            color={paymentStatusColor[row.payment_status] || "gray"}
            value={
              row.payment_status.charAt(0).toUpperCase() +
              row.payment_status.slice(1)
            }
            size="sm"
          />
        ),
      },
      {
        name: "Total Amount (₹)",
        selector: (row) => Number(row.total_amount) || 0,
        sortable: true,
        cell: (row) => (
          <span className="font-medium text-blue-gray-800">
            ₹{Number(row.total_amount).toFixed(2)}
          </span>
        ),
      },
      {
        name: "Address Print",
        selector: (row) => row.is_printed,
        sortable: true,
        cell: (row) => {
          const label = row.is_printed ? "Printed" : "Not Printed";
          const color = row.is_printed ? "green" : "red";

          return (
            <Chip
              color={color}
              value={label}
              size="sm"
            />
          );
        },
      },

      {
        name: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <IconButton
              size="sm"
              variant="text"
              color="gray"
              onClick={() => viewOrder(row)}
            >
              <EyeIcon className="h-5 w-5" />
            </IconButton>
            <IconButton size="sm" variant="text" onClick={() => printSingle(row.id)}>
              <PrinterIcon className="h-5 w-5" />
            </IconButton>

            <IconButton
              size="sm"
              variant="text"
              color="blue"
              onClick={() => updateStatus(row)}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </IconButton>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">Orders</h3>

        {/* 🌍 Global Search (auto-trigger) */}
        <div className="w-full sm:w-72">
          <Input
            crossOrigin=""
            color="gray"
            label="Global search..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">Loading...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            pagination
            paginationServer={!isGlobalSearch}
            paginationTotalRows={totalOrders}
            paginationPerPage={itemsPerPage}
            paginationDefaultPage={page}
            paginationResetDefaultPage={false}     // <- add this
            persistTableHead
            highlightOnHover
            responsive
            noHeader
            onChangePage={(newPage) => {
              if (!isGlobalSearch && newPage !== page) setPage(newPage);
            }}
            onChangeRowsPerPage={(newPerPage, newPage) => {
              if (!isGlobalSearch) {
                setItemsPerPage(newPerPage);
                setPage(newPage);
              }
            }}
          />

        )}
      </Card>

      {/* Modals */}
      {viewOpen && (
        <ViewOrder
          open={viewOpen}
          handleOpenClose={setViewOpen}
          orderId={viewOrderId}
        />
      )}
      {updateOpen && (
        <OrderUpdate
          open={updateOpen}
          handleOpenClose={setUpdateOpen}
          orderId={updateOrderId}
          refresh={() =>
            isGlobalSearch
              ? fetchGlobalSearch(search)
              : fetchOrders(page, itemsPerPage)
          }
        />
      )}
    </div>
  );
}
