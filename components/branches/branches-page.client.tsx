"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@heroui/table";
import {
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/dropdown";
import { GitBranch, Plus, MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight, Star, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import type { TBranch } from "@/types/branch.types";
import BranchModal from "@/components/branches/branch-modal";

type TProps = { branches: TBranch[] };

export default function BranchesPageClient({ branches }: TProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<TBranch | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => router.refresh();

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleDelete = async (branch: TBranch) => {
    if (!confirm(`Xóa chi nhánh "${branch.name}"?`)) return;
    const res = await fetch(`/api/branches/${branch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _delete: true }),
    });
    const result = await res.json();
    if (result.success) {
      addToast({ title: "Đã xóa chi nhánh", color: "success" });
      refresh();
    } else {
      addToast({ title: "Lỗi", description: result.error, color: "danger" });
    }
  };

  const handleToggleStatus = async (branch: TBranch) => {
    const newStatus = branch.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/branches/${branch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const result = await res.json();
    if (result.success) {
      addToast({ title: "Đã cập nhật trạng thái", color: "success" });
      refresh();
    } else {
      addToast({ title: "Lỗi", description: result.error, color: "danger" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            Quản lý chi nhánh
          </h1>
          <p className="text-default-600 mt-1">Tổng cộng {branches.length} chi nhánh</p>
        </div>
        <div className="flex items-center gap-2">
          
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => { setEditingBranch(null); setIsModalOpen(true); }}
          >
            Thêm chi nhánh
          </Button>
          <Button
            variant="flat"
            isIconOnly
            onPress={handleRefresh}
            isLoading={isRefreshing}
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table aria-label="Branches table">
            <TableHeader>
              <TableColumn>MÃ</TableColumn>
              <TableColumn>TÊN CHI NHÁNH</TableColumn>
              <TableColumn>ĐỊA CHỈ</TableColumn>
              <TableColumn>SỐ ĐIỆN THOẠI</TableColumn>
              <TableColumn>TRỤ SỞ CHÍNH</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn width={50}>THAO TÁC</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Chưa có chi nhánh nào">
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    {branch.code ? (
                      <span className="font-semibold text-sm text-default-600">{branch.code}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{branch.name}</span>
                  </TableCell>
                  <TableCell>{branch.address || "—"}</TableCell>
                  <TableCell>{branch.phone || "—"}</TableCell>
                  <TableCell>
                    {branch.is_headquarters ? (
                      <Chip color="warning" size="sm" variant="flat" startContent={<Star className="w-3 h-3" />}>
                        Trụ sở chính
                      </Chip>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={branch.status === "active" ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {branch.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                    </Chip>
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
                          onPress={() => { setEditingBranch(branch); setIsModalOpen(true); }}
                        >
                          Chỉnh sửa
                        </DropdownItem>
                        <DropdownItem
                          key="toggle"
                          startContent={branch.status === "active"
                            ? <ToggleLeft className="w-4 h-4" />
                            : <ToggleRight className="w-4 h-4" />}
                          color={branch.status === "active" ? "warning" : "success"}
                          onPress={() => handleToggleStatus(branch)}
                        >
                          {branch.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"}
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Trash2 className="w-4 h-4" />}
                          color="danger"
                          onPress={() => handleDelete(branch)}
                        >
                          Xóa
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

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={editingBranch}
        onSuccess={() => { setIsModalOpen(false); refresh(); }}
      />
    </div>
  );
}
