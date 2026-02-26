"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Users, Phone, User } from "lucide-react";

type TReference = {
  id: string;
  full_name: string;
  phone: string;
  relationship: string;
  created_at: string;
};

type TProps = {
  references: TReference[];
};

const ReferencesSection = ({ references }: TProps) => {
  if (references.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" className="col-span-2">
      <CardHeader className="flex items-center gap-2 pb-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Người tham chiếu</h3>
        <span className="text-sm text-default-500">({references.length})</span>
      </CardHeader>
      <CardBody className="pt-0 space-y-3">
        {references.map((ref) => (
          <div
            key={ref.id}
            className="p-3 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <p className="font-medium">{ref.full_name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {ref.relationship}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-default-600">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{ref.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

export default ReferencesSection;
