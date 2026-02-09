import type { ElementType } from "react";

const SectionHeader = ({
    icon: Icon,
    title,
}: {
    icon: ElementType;
    title: string;
}) => (
    <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
    </div>
);


export default SectionHeader