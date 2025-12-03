import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
    Button,
    Card,
    Spinner,
    Input,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, PrinterIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";

export default function PrintAddress() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);

    // Fetch ONLY unprinted orders with date filter
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get("orders/unprinted/", {
                params: {
                    from_date: fromDate || undefined,
                    to_date: toDate || undefined,
                },
            });

            const data =
                response.data?.data ||
                response.data?.results?.data ||
                response.data?.results ||
                [];

            setOrders(data);
            setFilteredOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    // Fetch when component loads
    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch when date filters change
    useEffect(() => {
        fetchOrders();
    }, [fromDate, toDate]);

    // Search filter (robust, checks multiple fields)
    useEffect(() => {
        const trimmed = (search || "").trim();
        if (!trimmed) {
            setFilteredOrders(orders);
            return;
        }

        const lower = trimmed.toLowerCase();

        const filtered = orders.filter((o) => {
            // normalize and guard each field
            const orderNo = (o.order_number || "").toString().toLowerCase();
            const custName = (o.customer_name || o.first_name || "").toString().toLowerCase();
            const phone = (o.contact_number || o.customer_phone || "").toString().toLowerCase();
            const addr = (o.shipping_address || "").toString().toLowerCase();

            return (
                orderNo.includes(lower) ||
                custName.includes(lower) ||
                phone.includes(lower) ||
                addr.includes(lower)
            );
        });

        setFilteredOrders(filtered);
    }, [search, orders]);

    // Print selected orders
    const handlePrint = async () => {
        if (selectedRows.length === 0) {
            toast.error("Select at least one address to print");
            return;
        }

        const ids = selectedRows.map((o) => o.id);

        try {
            toast.loading("Generating PDF...");

            const response = await api.post(
                "orders/print-address/",
                { order_ids: ids },
                { responseType: "blob" }
            );

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = fileURL;
            link.setAttribute("download", "address_labels.pdf");
            document.body.appendChild(link);
            link.click();

            toast.dismiss();
            toast.success("PDF Generated Successfully!");

            // Refresh list after printing (is_printed will now be true)
            fetchOrders();
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to generate PDF");
        }
    };

    // Table Columns
    const columns = [
        {
            name: "Order No",
            selector: (row) => row.order_number,
            sortable: true,
        },
        {
            name: "Customer Name",
            selector: (row) => row.customer_name,
            sortable: true,
            wrap: true,
        },
        {
            name: "Phone",
            selector: (row) => row.contact_number,
            sortable: true,
        },
        {
            name: "Address",
            selector: (row) => row.shipping_address,
            cell: (row) =>
                row.shipping_address?.length > 20
                    ? row.shipping_address.substring(0, 20) + "..."
                    : row.shipping_address,
            wrap: true,
        },
        {
            name: "Status",
            selector: (row) => (row.is_printed ? "Yes" : "No"),
            cell: (row) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${row.is_printed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.is_printed ? "Printed" : "Not Printed"}
                </span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-blue-gray-800">
                    Unprinted Addresses
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <Input
                        type="date"
                        label="From Date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <Input
                        type="date"
                        label="To Date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:w-64">
                        <Input
                            color="gray"
                            label="Search addresses..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        color="blue"
                        className="w-full sm:w-auto flex items-center gap-2 justify-center"
                        onClick={handlePrint}
                    >
                        <PrinterIcon className="h-5 w-5" />
                        <span>PRINT PDF</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="shadow-lg">
                {loading ? (
                    <div className="flex justify-center py-10 items-center gap-2">
                        <Spinner className="h-8 w-8" color="blue" />
                        <span className="text-blue-gray-400">Loading orders...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            selectableRows
                            onSelectedRowsChange={({ selectedRows }) =>
                                setSelectedRows(selectedRows)
                            }
                            pagination
                            paginationPerPage={itemsPerPage}
                            onChangeRowsPerPage={(size) => setItemsPerPage(size)}
                            highlightOnHover
                            responsive
                            noDataComponent="No unprinted orders found."
                            noHeader
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
