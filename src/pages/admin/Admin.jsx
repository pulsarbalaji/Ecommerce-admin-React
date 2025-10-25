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
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "@/utils/base_url";
import AddAdmin from "./AddAdmin";
import EditAdmin from "./EditAdmin";
import ViewAdmin from "./ViewAdmin";

export default function AdminUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("adminsdetails/");
      const data = response.data.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      toast.error("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.phone?.toLowerCase().includes(lower) ||
          u.role?.toLowerCase().includes(lower)
      )
    );
  }, [search, users]);

  const deleteUser = async () => {
    if (!selectedUser) return;
    const toastId = toast.loading("Deleting user...");
    try {
      const res = await api.delete(`adminsdetails/${selectedUser.id}/`);

      if (res.data?.status === true) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setDeleteDialogOpen(false);
        setSelectedUser(null);

        toast.success(res.data?.message || "User deleted successfully!", { id: toastId });
      } else {
        throw new Error(res.data?.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.dismiss(toastId);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while deleting user.";

      toast.error(msg, { id: toastId });
    }
  };

  const columns = [
    { name: "Full Name", selector: (row) => row.full_name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <IconButton
            size="sm"
            variant="text"
            color="blue"
            onClick={() => {
              setEditUserId(row.id);
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

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">Admin Users List</h3>
        <div className="flex items-center gap-10">
          <div className="w-2/4">
            <Input
              color="gray"
              label="Search users..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button color="gray" onClick={() => setAddOpen(true)}>
            + Add User
          </Button>
        </div>
        <AddAdmin open={addOpen} handleOpenClose={setAddOpen} />
      </div>

      {/* DataTable */}
      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="text-blue-gray-400">Loading users...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            highlightOnHover
            responsive
            noDataComponent="No users found."
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
        <DialogBody className="text-black text-base">
          Are you sure you want to delete{" "}
          <strong className="text-red-500">{selectedUser?.full_name}</strong>?
        </DialogBody>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="text" color="blue-gray" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={deleteUser}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Modal */}
      {editOpen && (
        <EditAdmin
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editUserId}
          userId={editUserId}
        />
      )}

      {/* View Modal */}
      <ViewAdmin open={viewOpen} handleOpenClose={setViewOpen} userId={selectedUserId} />
    </div>
  );
}
