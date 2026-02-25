-- Digital Committee Manager Schema

-- 1. Committees Table
CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mosque', 'madrasah', 'club', 'building')),
    district TEXT,
    subdomain TEXT UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Extending Supabase Auth Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    committee_id UUID REFERENCES committees(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'member')) DEFAULT 'member',
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Members Table (Committee Members)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    monthly_contribution_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Contributions Table (Monthly payments by members)
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    month DATE NOT NULL, -- Store as first day of the month
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Donations Table (One-time donations)
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    phone TEXT,
    amount DECIMAL(12,2) NOT NULL,
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Committees: Super Admin can see all, others see their own
CREATE POLICY "Committees are viewable by their members" ON committees
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.committee_id = committees.id OR profiles.role = 'super_admin'))
    );

-- Profiles: Users can see their own profile, Admins see their committee profiles
CREATE POLICY "Profiles are viewable by committee admins" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = profiles.committee_id OR p.role = 'super_admin'))
    );

-- Members: Committee isolation
CREATE POLICY "Members are viewable by committee users" ON members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = members.committee_id OR p.role = 'super_admin'))
    );

CREATE POLICY "Admins can manage members" ON members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = members.committee_id OR p.role = 'super_admin'))
    );

-- Contributions: Committee isolation
CREATE POLICY "Contributions are viewable by committee users" ON contributions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = contributions.committee_id OR p.role = 'super_admin'))
    );

CREATE POLICY "Admins can manage contributions" ON contributions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = contributions.committee_id OR p.role = 'super_admin'))
    );

-- Donations: Committee isolation
CREATE POLICY "Donations are viewable by committee users" ON donations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = donations.committee_id OR p.role = 'super_admin'))
    );

CREATE POLICY "Admins can manage donations" ON donations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = donations.committee_id OR p.role = 'super_admin'))
    );

-- Expenses: Committee isolation
CREATE POLICY "Expenses are viewable by committee users" ON expenses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = expenses.committee_id OR p.role = 'super_admin'))
    );

CREATE POLICY "Admins can manage expenses" ON expenses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = expenses.committee_id OR p.role = 'super_admin'))
    );
