export type Role = 'super_admin' | 'admin' | 'member';
export type CommitteeType = 'mosque' | 'madrasah' | 'club' | 'building';

export interface Committee {
  id: string;
  name: string;
  type: CommitteeType;
  district: string;
  subdomain?: string;
  logo_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  committee_id: string | null;
  role: Role;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface Member {
  id: string;
  committee_id: string;
  name: string;
  phone: string;
  address: string;
  monthly_contribution_amount: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Contribution {
  id: string;
  committee_id: string;
  member_id: string;
  amount: number;
  month: string;
  payment_status: 'paid' | 'pending';
  created_at: string;
  member?: Member;
}

export interface Donation {
  id: string;
  committee_id: string;
  donor_name: string;
  phone: string;
  amount: number;
  purpose: string;
  created_at: string;
}

export interface Expense {
  id: string;
  committee_id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  created_at: string;
}
