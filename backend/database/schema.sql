-- Run this in your Supabase SQL Editor to create the necessary tables.

CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    organizer_name TEXT NOT NULL,
    category TEXT,
    goal_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_name TEXT,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read campaigns
CREATE POLICY "Allow public read access to campaigns" 
ON public.campaigns FOR SELECT USING (true);

-- Insert dummy data for testing the UI
INSERT INTO public.campaigns (title, description, organizer_name, category, goal_amount, current_amount, image_url)
VALUES 
('Help Build a School', 'We are collecting funds to build a new school in the rural province.', 'Education Foundation', 'Education', 50000, 12500, 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&q=80'),
('Medical Aid for Typhoon Victims', 'Providing relief goods and medical aid for displaced families.', 'Red Cross PH', 'Disaster Relief', 100000, 45000, 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&q=80'),
('Animal Rescue Shelter Expansion', 'Help us build more space for abandoned dogs and cats.', 'Paws Hope', 'Animals', 20000, 5000, 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80');
