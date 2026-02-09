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
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { Bell } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import Notification from "@/components/notification";
import CreateContractButton from "@/components/create-contract/create-contract-button.client";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Left: Logo + Nav links */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink
            className="flex justify-start items-center gap-1"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">ShortLoan</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* Right: Actions (desktop) */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {/* Create contract button */}
        <NavbarItem>
          <CreateContractButton />
        </NavbarItem>

        {/* Notification bell */}
        <NavbarItem className="flex items-center">
          <Notification />
        </NavbarItem>

        {/* Theme switch */}
        <NavbarItem className="flex items-center">
          <ThemeSwitch />
        </NavbarItem>

        {/* User avatar dropdown */}
        <NavbarItem className="flex items-center">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform cursor-pointer"
                color="primary"
                name="User"
                showFallback
                isBordered
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem
                key="profile"
                className="h-14 gap-2"
                textValue="Thông tin user"
              >
                <p className="font-semibold">Đăng nhập với</p>
                <p className="text-sm text-default-500">user@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings" textValue="Cài đặt">
                Cài đặt
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                textValue="Đăng xuất"
              >
                Đăng xuất
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile: Actions */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Badge color="danger" content="3" shape="circle">
          <Button
            isIconOnly
            aria-label="Thông báo"
            radius="full"
            variant="light"
          >
            <Bell className="text-default-500" size={20} />
          </Button>
        </Badge>
        <Avatar
          as="button"
          className="transition-transform"
          color="primary"
          name="User"
          showFallback
        />
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {/* Create contract button in mobile menu */}
          <NavbarMenuItem>
            <CreateContractButton className="w-full" />
          </NavbarMenuItem>

          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={
                  index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
