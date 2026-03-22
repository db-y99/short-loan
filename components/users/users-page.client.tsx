"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@heroui/table";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/dropdown";
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  ShieldCheck,
  UserCheck, 
  UserX,
  KeyRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLES } from "@/constants/roles";
import { USER_STATUS } from "@/lib/constants";
import { Profile } from "@/services/profiles.service";
import { formatDate } from "@/lib/format";
import CreateUserModal from "@/components/users/create-user-modal";
import EditUserModal from "@/components/users/edit-user-modal";
import UpdateRoleModal from "@/components/users/update-role-modal";
import ResetPasswordModal from "@/components/users/reset-password-modal";

type TProps = {
  profiles: Profile[];
  total: number;
  currentPage: number;
  searchQuery: string;
};

const UsersPageClient = ({ profiles, total, currentPage, searchQuery }: TProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [updatingRoleUser, setUpdatingRoleUser] = useState<Profile | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<Profile | null>(null);

  const totalPages = Math.ceil(total / 20);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page
    router.push(`/users?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/users?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return "success";
      case USER_STATUS.INACTIVE:
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return "Hoạt động";
      case USER_STATUS.INACTIVE:
        return "Không hoạt động";
      case "pending":
        return "Chờ duyệt";
      default:
        return "Không xác định";
    }
  };

  const refreshData = () => {
    router.refresh();
  };

  const handleToggleStatus = async (user: Profile) => {
    const newStatus = user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        refreshData();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Quản lý người dùng
          </h1>
          <p className="text-default-600 mt-1">
            Tổng cộng {total} người dùng
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={search}
              onValueChange={setSearch}
              onKeyPress={handleKeyPress}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              className="flex-1"
            />
            <Button color="primary" onPress={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>TÊN</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn>NGÀY TẠO</TableColumn>
              <TableColumn width={50}>THAO TÁC</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Không có người dùng nào">
              {profiles.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-xs text-default-500">ID: {user.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      color={user.role === ROLES.ADMIN ? "secondary" : "default"}
                      size="sm"
                      variant="flat"
                    >
                      {user.role || ROLES.USER}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(user.status)}
                      size="sm"
                      variant="flat"
                    >
                      {getStatusLabel(user.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? formatDate(user.created_at) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit className="w-4 h-4" />}
                          onPress={() => setEditingUser(user)}
                        >
                          Chỉnh sửa
                        </DropdownItem>
                        <DropdownItem
                          key="update-role"
                          startContent={<ShieldCheck className="w-4 h-4" />}
                          onPress={() => setUpdatingRoleUser(user)}
                        >
                          Cập nhật Role
                        </DropdownItem>
                        <DropdownItem
                          key="reset-password"
                          startContent={<KeyRound className="w-4 h-4" />}
                          color="warning"
                          onPress={() => setResettingPasswordUser(user)}
                        >
                          Đặt lại mật khẩu
                        </DropdownItem>
                        <DropdownItem
                          key="toggle-status"
                          startContent={
                            user.status === USER_STATUS.ACTIVE ? 
                            <UserX className="w-4 h-4" /> : 
                            <UserCheck className="w-4 h-4" />
                          }
                          color={user.status === USER_STATUS.ACTIVE ? "warning" : "success"}
                          onPress={() => handleToggleStatus(user)}
                        >
                          {user.status === USER_STATUS.ACTIVE ? "Vô hiệu hóa" : "Kích hoạt"}
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
          />
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshData}
      />

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onSuccess={refreshData}
        />
      )}

      {updatingRoleUser && (
        <UpdateRoleModal
          isOpen={!!updatingRoleUser}
          onClose={() => setUpdatingRoleUser(null)}
          user={updatingRoleUser}
          onSuccess={refreshData}
        />
      )}

      {resettingPasswordUser && (
        <ResetPasswordModal
          isOpen={!!resettingPasswordUser}
          onClose={() => setResettingPasswordUser(null)}
          user={resettingPasswordUser}
        />
      )}
    </div>
  );
};

export default UsersPageClient;