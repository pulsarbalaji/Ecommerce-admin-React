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
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import AddAdmin from "./AddAdmin";
import EditAdmin from "./EditAdmin"; // import your edit modal
import ViewAdmin from "./ViewAdmin";

export default function AdminUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editUserId, setEditUserId] = useState(null); // for modal
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get("adminsdetails/");
                setUsers(response.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const columns = [
        { name: "Full Name", selector: row => row.full_name, sortable: true },
        { name: "Email", selector: row => row.email, sortable: true },
        { name: "Phone", selector: row => row.phone, sortable: true },
        { name: "Role", selector: row => row.role, sortable: true },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    <IconButton
                        size="sm"
                        variant="text"
                        color="blue"
                        onClick={() => {
                            setEditUserId(row.id); // set user id to edit
                            setEditOpen(true); // open modal

                        }}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                        size="sm"
                        variant="text"
                        color="red"
                        onClick={() => {
                            setSelectedUser(row);
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
                            setSelectedUserId(row.id);
                            setViewOpen(true);
                        }}
                    >
                        <EyeIcon className="h-5 w-5" />
                    </IconButton>
                </div>
            ),
        },
    ];

    const deleteUser = async () => {
        if (!selectedUser) return;
        try {
            await api.delete(`adminsdetails/${selectedUser.id}/`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-blue-gray-800">Admin Users List</h3>
                <Button color="gray" onClick={() => setAddOpen(true)}>
                    + Add User
                </Button>
                <AddAdmin open={addOpen} handleOpenClose={setAddOpen} />
            </div>

            {/* DataTable */}
            <Card className="shadow-lg">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner className="h-8 w-8" color="blue" />
                        <span className="ml-2 text-blue-gray-400">Loading users...</span>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        pagination
                        highlightOnHover
                        responsive
                    />
                )}
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} size="sm" handler={setDeleteDialogOpen}>
                <DialogHeader className="flex justify-center">
                    <Typography variant="h5" className="font-semibold">
                        Confirm Deletion
                    </Typography>
                </DialogHeader>
                <DialogBody  className="text-black text-base">
                    Are you sure you want to delete <strong className="text-red-500" >{selectedUser?.full_name}</strong>?
                </DialogBody>
                <DialogFooter  className="flex justify-center gap-4">
                    <Button variant="text" color="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button color="red" onClick={deleteUser}>Delete</Button>
                </DialogFooter>
            </Dialog>

            {/* Edit Modal */}
            {editOpen && (
                <EditAdmin
                    open={editOpen}
                    handleOpenClose={setEditOpen}
                    key={editUserId} // ensures re-render when changing user
                    userId={editUserId} // pass id to modal
                />
            )}

            <ViewAdmin
                open={viewOpen}
                handleOpenClose={setViewOpen}
                userId={selectedUserId}
            />
        </div>
    );
}
