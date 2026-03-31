export type TBranch = {
  id: string;
  code: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  status: "active" | "inactive";
  is_headquarters: boolean;
  created_at: string;
};

export type TBranchFormData = {
  code?: string;
  name: string;
  address?: string;
  phone?: string;
  is_headquarters?: boolean;
};
