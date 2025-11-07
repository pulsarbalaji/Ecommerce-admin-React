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
    Select,
    Option,
} from "@material-tailwind/react";
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import AddProductVariant from "./addproductVariant";
import EditVariant from "./EditProductVariant";
import ViewVariant from "./ViewProductVariant";

export default function ProductVariant() {
    const [variants, setVariants] = useState([]);
    const [mainProducts, setMainProducts] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [viewProductId, setViewProductId] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalVariants, setTotalVariants] = useState(0);
    const backendBaseUrl = import.meta.env.VITE_API_URL;

    // ✅ Fetch main products for dropdown
    const fetchMainProducts = async () => {
        try {
            const res = await api.get("mainproductlist/");
            if (res.data.status) setMainProducts(res.data.data);
        } catch {
            toast.error("Failed to load main products");
        }
    };

    // ✅ Fetch variants (all or filtered by main product)
    const fetchVariants = async (pageNumber = page, pageSize = itemsPerPage) => {
        setLoading(true);
        try {
            const endpoint = selectedParent
                ? `productvariantfilter/?parent_id=${selectedParent}&page=${pageNumber}&page_size=${pageSize}`
                : `productvariant/?page=${pageNumber}&page_size=${pageSize}`;
            const res = await api.get(endpoint);

            const data =
                res.data?.results?.data ||
                res.data?.data?.data ||
                res.data?.data ||
                [];

            setVariants(data);
            setTotalVariants(res.data?.count || data.length || 0);
        } catch (err) {
            toast.error("Failed to load variants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMainProducts();
        fetchVariants();
    }, [page, itemsPerPage, selectedParent]);

    // ✅ Live client-side search filter
    const filtered = variants.filter(
        (v) =>
            v.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            v.category_name?.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Delete variant
    const deleteVariant = async () => {
        if (!selectedVariant) return;
        const toastId = toast.loading("Deleting variant...");
        try {
            await api.delete(`productvariant/${selectedVariant.id}/`);
            toast.success("Variant deleted successfully!", { id: toastId });
            setVariants((prev) => prev.filter((v) => v.id !== selectedVariant.id));
            setDeleteDialogOpen(false);
        } catch {
            toast.error("Failed to delete variant", { id: toastId });
        }
    };

    // ✅ Table columns
    const columns = [
        {
            name: "Parent Product",
            selector: (row) => row.parent_name || "—",
            wrap: true,
        },
        {
            name: "Variant Name",
            selector: (row) => row.product_name,
            wrap: true,
        },
        {
            name: "Image",
            cell: (row) => (
                <img
                    src={
                        row.product_image?.startsWith("http")
                            ? row.product_image
                            : `${backendBaseUrl}${row.product_image}`
                    }
                    alt={row.product_name}
                    className="h-10 w-10 rounded object-cover"
                />
            ),
        },
        {
            name: "Price",
            selector: (row) => `₹${row.price}`,
            sortable: true,
        },
        {
            name: "Quantity",
            selector: (row) => `${row.quantity} ${row.quantity_unit}`,
            sortable: true,
            cell: (row) => (
                <span className="font-medium">
                    {row.quantity} {row.quantity_unit}
                </span>
            ),
        },
        {
            name: "Stock",
            selector: (row) => row.stock_quantity,
            cell: (row) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${row.stock_quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.stock_quantity > 0 ? row.stock_quantity : "Out of stock"}
                </span>
            ),
        },
        {
            name: "Availability",
            selector: (row) => row.is_available ? "Yes" : "No",
            sortable: true,
            cell: (row) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full ${row.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.is_available ? "Available" : "Not Avaialable"}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-1">
                    <IconButton
                        size="sm"
                        variant="text"
                        color="blue"
                        onClick={() => {
                            setEditProductId(row.id);
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
                            setSelectedVariant(row);
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
                            setViewProductId(row.id);
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
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-blue-gray-800">
                    Variant Products
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-52">
                        <Select
                            label="Filter by Main Product"
                            value={selectedParent}
                            onChange={(val) => setSelectedParent(val)}
                        >
                            {mainProducts.map((p) => (
                                <Option key={p.id} value={p.id}>
                                    {p.product_name}
                                </Option>
                            ))}
                        </Select>
                    </div>


                    <div className="w-64">
                        <Input
                            label="Search variants..."
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
                        + Add Product
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg">
                {loading ? (
                    <div className="flex justify-center items-center py-10 gap-2">
                        <Spinner className="h-8 w-8" color="blue" />
                        <span>Loading variants...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            pagination
                            paginationServer
                            paginationTotalRows={totalVariants}
                            paginationPerPage={itemsPerPage}
                            paginationDefaultPage={page}
                            onChangePage={(p) => setPage(p)}
                            onChangeRowsPerPage={(size, p) => {
                                setItemsPerPage(size);
                                setPage(p);
                            }}
                            highlightOnHover
                            responsive
                            noDataComponent="No variants found."
                            noHeader
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
                        {selectedVariant?.product_name}
                    </strong>
                    ?
                </DialogBody>
                <DialogFooter className="flex justify-center gap-4">
                    <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={deleteVariant}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>
            {addOpen && (
                <AddProductVariant open={addOpen} handleOpenClose={setAddOpen} refresh={fetchVariants} />
            )}
            {editOpen && (
                <EditVariant
                    open={editOpen}
                    handleOpenClose={setEditOpen}
                    key={editProductId}
                    variantId={editProductId}
                    refresh={fetchVariants}
                />
            )}
            <ViewVariant
                open={viewOpen}
                handleOpenClose={setViewOpen}
                variantId={viewProductId}
            />
        </div>
    );
}
