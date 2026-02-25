-- Digital Committee Manager Schema (Idempotent Version)

-- 1. Committees Table
CREATE TABLE IF NOT EXISTS committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mosque', 'madrasah', 'club', 'building')),
    district TEXT,
    subdomain TEXT UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Extending Supabase Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    committee_id UUID REFERENCES committees(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'member')) DEFAULT 'member',
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Members Table (Committee Members)
CREATE TABLE IF NOT EXISTS members (
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
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    month DATE NOT NULL, -- Store as first day of the month
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Donations Table (One-time donations)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    phone TEXT,
    amount DECIMAL(12,2) NOT NULL,
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'admin')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid duplicates
DO $$ 
BEGIN
    -- Committees
    DROP POLICY IF EXISTS "Committees are viewable by their members" ON committees;
    -- Profiles
    DROP POLICY IF EXISTS "Profiles are viewable by committee admins" ON profiles;
    -- Members
    DROP POLICY IF EXISTS "Members are viewable by committee users" ON members;
    DROP POLICY IF EXISTS "Admins can manage members" ON members;
    -- Contributions
    DROP POLICY IF EXISTS "Contributions are viewable by committee users" ON contributions;
    DROP POLICY IF EXISTS "Admins can manage contributions" ON contributions;
    -- Donations
    DROP POLICY IF EXISTS "Donations are viewable by committee users" ON donations;
    DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
    -- Expenses
    DROP POLICY IF EXISTS "Expenses are viewable by committee users" ON expenses;
    DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
END $$;

-- Re-create Policies
CREATE POLICY "Committees are viewable by their members" ON committees
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.committee_id = committees.id OR profiles.role = 'super_admin')));

CREATE POLICY "Profiles are viewable by committee admins" ON profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = profiles.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Members are viewable by committee users" ON members
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = members.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Admins can manage members" ON members
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = members.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Contributions are viewable by committee users" ON contributions
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = contributions.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Admins can manage contributions" ON contributions
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = contributions.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Donations are viewable by committee users" ON donations
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = donations.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Admins can manage donations" ON donations
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = donations.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Expenses are viewable by committee users" ON expenses
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.committee_id = expenses.committee_id OR p.role = 'super_admin')));

CREATE POLICY "Admins can manage expenses" ON expenses
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin') AND (p.committee_id = expenses.committee_id OR p.role = 'super_admin')));
