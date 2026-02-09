import { Link } from "@heroui/link";
import { cn } from "@heroui/react";
import type { ElementType } from "react";

const InfoRow = ({
    icon: Icon,
    label,
    value,
    isLink = false,
    href,
    className,
}: {
    icon: ElementType;
    label: string;
    value: string;
    isLink?: boolean;
    href?: string;
    className?: string;
}) => (
    <div className={cn("flex items-start gap-2 py-1.5", className)}>
        <Icon className="w-4 h-4 text-default-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-default-400">{label}</p>
            {isLink && href ? (
                <Link isExternal className="text-sm" href={href}>
                    {value}
                </Link>
            ) : (
                <p className="text-sm font-medium break-words">{value}</p>
            )}
        </div>
    </div>
);

export default InfoRow