"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { useDisclosure } from "@heroui/react";
import { LogOut, Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { useAuth } from "@/lib/contexts/auth-context";

type Props = {
  userEmail?: string;
  userName?: string;
  onOpenSidebar?: () => void;
};

export default function Navbar({ onOpenSidebar }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseModal = () => {
    setSearchQuery("");
    onClose();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    handleCloseModal();
  };

  const filteredNavItems = siteConfig.navMenuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Tìm kiếm..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onFocus={onOpen}
    />
  );

  return (
    <HeroUINavbar
      className="border-b border-divider"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        {user && (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user.user_metadata?.full_name || user.email || "User"}
                  size="sm"
                  src={user.user_metadata?.avatar_url}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownSection showDivider>
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="Profile"
                  >
                    <User
                      name={user.user_metadata?.full_name || "User"}
                      description={user.email}
                      classNames={{
                        name: "text-default-600 font-semibold",
                        description: "text-default-500",
                      }}
                      avatarProps={{
                        size: "sm",
                        src: user.user_metadata?.avatar_url,
                      }}
                    />
                  </DropdownItem>
                </DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut size={18} />}
                  onPress={handleLogout}
                  className={isLoggingOut ? "opacity-50" : ""}
                >
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {onOpenSidebar ? (
          <NavbarItem>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-default-100"
              onClick={onOpenSidebar}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
          </NavbarItem>
        ) : (
          <NavbarMenuToggle />
        )}
      </NavbarContent>

      {!onOpenSidebar && (
        <NavbarMenu>
          {searchInput}
          {user && (
            <div className="mx-4 mt-4 mb-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-default-100">
                <Avatar
                  isBordered
                  color="primary"
                  name={user.user_metadata?.full_name || user.email || "User"}
                  size="md"
                  src={user.user_metadata?.avatar_url}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-default-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.href}-${index}`}>
                <Link
                  color={pathname === item.href ? "primary" : "foreground"}
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
            {user && (
              <NavbarMenuItem>
                <button
                  className="w-full text-left text-danger font-medium flex items-center gap-2 py-2"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={18} />
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </NavbarMenuItem>
            )}
          </div>
        </NavbarMenu>
      )}

      {/* Search Modal */}
      {isOpen && (
        <Modal
          hideCloseButton
          isDismissable
          isKeyboardDismissDisabled={false}
          isOpen={isOpen}
          placement="top"
          size="2xl"
          onClose={handleCloseModal}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <Input
                autoFocus
                classNames={{
                  inputWrapper: "bg-default-100",
                  input: "text-sm",
                }}
                placeholder="Tìm kiếm..."
                startContent={<SearchIcon size={18} />}
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredNavItems.length > 0) {
                    handleNavigate(filteredNavItems[0].href);
                  }
                }}
                onValueChange={setSearchQuery}
              />
            </ModalHeader>
            <ModalBody className="py-2">
              {filteredNavItems.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.href}
                      className={clsx(
                        "w-full text-left px-4 py-3 rounded-lg",
                        "hover:bg-default-100 transition-colors",
                        "flex items-center gap-2"
                      )}
                      onClick={() => handleNavigate(item.href)}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-default-400">
                        {item.href}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-default-500">
                  Không tìm thấy kết quả
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </HeroUINavbar>
  );
}

