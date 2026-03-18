import { ShieldX } from "lucide-react";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function UnauthorizedAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <ShieldX className="w-16 h-16 text-danger opacity-80" />
      <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
      <p className="text-default-500 max-w-sm">
        Bạn không có quyền truy cập trang này. Vui lòng liên hệ bộ phận IT để được cấp quyền.
      </p>
      <Button as={Link} href="/" color="primary" variant="flat">
        Về trang chủ
      </Button>
    </div>
  );
}
