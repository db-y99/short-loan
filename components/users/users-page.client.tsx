"use client";

import type { TBranch } from "@/types/branch.types";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
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
  branches: TBranch[];
  selectedBranch: string;
};

const UsersPageClient = ({
  profiles,
  total,
  currentPage,
  searchQuery,
  branches,
  selectedBranch,
}: TProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [updatingRoleUser, setUpdatingRoleUser] = useState<Profile | null>(
    null,
  );
  const [resettingPasswordUser, setResettingPasswordUser] =
    useState<Profile | null>(null);

  const totalPages = Math.ceil(total / 20);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/users?${params.toString()}`);
  };

  const handleBranchFilter = (branchId: string) => {
    const params = new URLSearchParams(searchParams);

    if (branchId) {
      params.set("branch", branchId);
    } else {
      params.delete("branch");
    }
    params.delete("page");
    router.push(`/users?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());
    router.push(`/users?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const getBranchName = (branchId?: string | null) => {
    if (!branchId) return "—";

    return branches.find((b) => b.id === branchId)?.name || "—";
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
    const newStatus =
      user.status === USER_STATUS.ACTIVE
        ? USER_STATUS.INACTIVE
        : USER_STATUS.ACTIVE;

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
          <p className="text-default-600 mt-1">Tổng cộng {total} người dùng</p>
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
          <div className="flex gap-2 flex-wrap">
            <Input
              className="flex-1 min-w-[200px]"
              placeholder="Tìm kiếm theo tên hoặc email..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={search}
              onKeyPress={handleKeyPress}
              onValueChange={setSearch}
            />
            {isClient && branches.length > 0 && (
              <Select
                aria-label="Lọc theo chi nhánh"
                className="w-48"
                placeholder="Tất cả chi nhánh"
                selectedKeys={selectedBranch ? [selectedBranch] : []}
                onSelectionChange={(keys) => {
                  const val = (Array.from(keys)[0] as string) || "";

                  handleBranchFilter(val);
                }}
              >
                {branches.map((b) => (
                  <SelectItem key={b.id}>{b.name}</SelectItem>
                ))}
              </Select>
            )}
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
              <TableColumn>CHI NHÁNH</TableColumn>
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
                      <span className="text-xs text-default-500">
                        ID: {user.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getBranchName(user.branch_id)}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        user.role === ROLES.ADMIN
                          ? "secondary"
                          : user.role === ROLES.CA
                            ? "primary"
                            : "default"
                      }
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
                        <Button isIconOnly size="sm" variant="light">
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
                          color="warning"
                          startContent={<KeyRound className="w-4 h-4" />}
                          onPress={() => setResettingPasswordUser(user)}
                        >
                          Đặt lại mật khẩu
                        </DropdownItem>
                        <DropdownItem
                          key="toggle-status"
                          color={
                            user.status === USER_STATUS.ACTIVE
                              ? "warning"
                              : "success"
                          }
                          startContent={
                            user.status === USER_STATUS.ACTIVE ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )
                          }
                          onPress={() => handleToggleStatus(user)}
                        >
                          {user.status === USER_STATUS.ACTIVE
                            ? "Vô hiệu hóa"
                            : "Kích hoạt"}
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
            showControls
            showShadow
            page={currentPage}
            total={totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        branches={branches}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshData}
      />

      {editingUser && (
        <EditUserModal
          branches={branches}
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={refreshData}
        />
      )}

      {updatingRoleUser && (
        <UpdateRoleModal
          isOpen={!!updatingRoleUser}
          user={updatingRoleUser}
          onClose={() => setUpdatingRoleUser(null)}
          onSuccess={refreshData}
        />
      )}

      {resettingPasswordUser && (
        <ResetPasswordModal
          isOpen={!!resettingPasswordUser}
          user={resettingPasswordUser}
          onClose={() => setResettingPasswordUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPageClient;
