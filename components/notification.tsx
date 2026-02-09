import { Badge, Button } from "@heroui/react";
import { NotificationIcon } from "@/components/icons";



export default function Notification() {
    return (
        <Badge color="danger" content="99+" shape="circle">
            <Button isIconOnly aria-label="more than 99 notifications" radius="full" variant="light">
                <NotificationIcon size={24} />
            </Button>
        </Badge>
    );
}
