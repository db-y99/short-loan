export type TBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: "active" | "inactive";
  is_headquarters: boolean;
  created_at: string;
};

export type TBranchFormData = {
  name: string;
  address?: string;
  phone?: string;
  is_headquarters?: boolean;
};
