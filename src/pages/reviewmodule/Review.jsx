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
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import ViewReview from "./viewReview";
import UpdateReviewStatus from "./UpdateReview";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Review() {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mainProducts, setMainProducts] = useState([]);

    const [filterCategory, setFilterCategory] = useState("");
    const [filterProduct, setFilterProduct] = useState("");
    const [filterRating, setFilterRating] = useState("");

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const [ordering, setOrdering] = useState("-created_at");

    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);

    // ------------------------------
    // FETCH CATEGORY + MAIN PRODUCTS
    // ------------------------------
    const fetchCategories = async () => {
        try {
            const res = await api.get("categories/");
            setCategories(res.data?.data || []);
        } catch {
            toast.error("Failed to load categories");
        }
    };

    const fetchMainProducts = async () => {
        try {
            const res = await api.get("mainproductlist/");
            if (res.data.status) setMainProducts(res.data.data);
        } catch {
            toast.error("Failed to load main products");
        }
    };

    // ------------------------------
    // FETCH REVIEWS (SERVER SIDE)
    // ------------------------------
    const fetchReviews = async (
        pageNumber = page,
        pageSize = perPage,
        order = ordering
    ) => {
        setLoading(true);
        try {
            const res = await api.get("admin-feedback-list/", {
                params: {
                    category_id: filterCategory,
                    product_id: filterProduct,
                    rating: filterRating,
                    ordering: order,
                    page: pageNumber,
                    page_size: pageSize,
                },
            });

            const apiData = res.data;
            setReviews(apiData.results || []);
            setTotalRows(apiData.total_count || 0);

        } catch {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCategories();
        fetchMainProducts();
    }, []);

    // Reload when page, page_size, filters, ordering changes
    useEffect(() => {
        fetchReviews(page, perPage, ordering);
    }, [page, perPage, filterCategory, filterProduct, filterRating, ordering]);

    // ------------------------------
    // CLIENT-SIDE SEARCH ONLY
    // ------------------------------
    const filteredReviews = reviews.filter((r) =>
        r.comment?.toLowerCase().includes(search.toLowerCase())
    );

    // ------------------------------
    // DELETE REVIEW
    // ------------------------------
    const deleteReview = async () => {
        if (!selectedReview) return;
        const toastId = toast.loading("Deleting review...");
        try {
            await api.delete(`admin-feedback-delete/${selectedReview.id}/`);
            toast.success("Review deleted!", { id: toastId });
            setDeleteDialogOpen(false);
            fetchReviews(page, perPage, ordering);
        } catch {
            toast.error("Delete failed", { id: toastId });
        }
    };

    // ------------------------------
    // TABLE COLUMNS
    // ------------------------------
    const columns = [
        {
            name: "Product",
            selector: (row) => row.product_name,
            sortable: true,
            sortField: "product_name",
        },
        {
            name: "User",
            selector: (row) => row.user_name,
            sortable: true,
            sortField: "user_name",
        },
        {
            name: "Rating",
            selector: (row) => row.rating,
            sortable: true,
            right: true,
        },
        {
            name: "Comment",
            selector: (row) => row.comment,
            cell: (row) =>
                row.comment?.length > 20
                    ? row.comment.substring(0, 20) + "..."
                    : row.comment,
        },
        {
            name: "Status",
            selector: (row) => row.is_approved,
            sortable: true,
            cell: (row) =>
                row.is_approved ? (
                    <span className="text-green-600">Approved</span>
                ) : (
                    <span className="text-orange-600">Pending</span>
                ),
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-1">
                    <IconButton
                        size="sm"
                        variant="text"
                        color="red"
                        onClick={() => {
                            setSelectedReview(row);
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
                            setSelectedReview(row.id);
                            setViewOpen(true);
                        }}
                    >
                        <EyeIcon className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        size="sm"
                        variant="text"
                        color="blue"
                        onClick={() => {
                            setSelectedReview(row.id);
                            setEditOpen(true);
                        }}
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </IconButton>
                </div>
            ),
        },
    ];

    // ------------------------------
    // HANDLE SORT SERVER-SIDE
    // ------------------------------
    const handleSort = (column, direction) => {
        const field = column.sortField;

        if (!field) return;

        const order = direction === "asc" ? field : `-${field}`;
        setOrdering(order); // triggers API call
    };

    // ------------------------------
    // RENDER
    // ------------------------------
    return (
        <div className="min-h-screen bg-white p-4 sm:p-6">

            {/* ---------------- FILTERS ---------------- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-blue-gray-800">
                    Product Review Details
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">

                    <Select
                        label="Filter by Category"
                        value={filterCategory}
                        onChange={(val) => {
                            setFilterCategory(val);
                            setPage(1);
                        }}
                        className="w-52"
                    >
                        {categories.map((c) => (
                            <Option key={c.id} value={String(c.id)}>
                                {c.category_name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Filter by Product"
                        value={filterProduct}
                        onChange={(val) => {
                            setFilterProduct(val);
                            setPage(1);
                        }}
                        className="w-52"
                    >
                        {mainProducts.map((p) => (
                            <Option key={p.id} value={String(p.id)}>
                                {p.product_name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Filter by Rating"
                        value={filterRating}
                        onChange={(val) => {
                            setFilterRating(val);
                            setPage(1);
                        }}
                        className="w-52"
                    >
                        {[5, 4, 3, 2, 1].map((num) => (
                            <Option key={num} value={String(num)}>
                                {num} Star
                            </Option>
                        ))}
                    </Select>

                    <Input
                        label="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    />
                </div>
            </div>

            {/* ---------------- TABLE ---------------- */}
            <Card className="shadow-lg">
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={filteredReviews}
                            pagination
                            paginationServer
                            onChangePage={(p) => setPage(p)}
                            paginationTotalRows={totalRows}
                            paginationPerPage={perPage}
                            onChangeRowsPerPage={(n) => setPerPage(n)}
                            sortServer
                            onSort={handleSort}
                            highlightOnHover
                            persistTableHead
                        />
                    </div>
                )}
            </Card>

            {/* ---------------- DELETE DIALOG ---------------- */}
            <Dialog open={deleteDialogOpen} handler={setDeleteDialogOpen}>
                <DialogHeader>Confirm Delete</DialogHeader>
                <DialogBody>
                    Are you sure you want to delete this review?
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={deleteReview}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>

            <ViewReview open={viewOpen} handleOpenClose={setViewOpen} reviewId={selectedReview} />
            <UpdateReviewStatus open={editOpen} handleOpenClose={setEditOpen} reviewId={selectedReview} />

        </div>
    );
}
