-- Add phone_number and parent_id to the tuitions table
ALTER TABLE public.tuitions
ADD COLUMN phone_number TEXT,
ADD COLUMN parent_id UUID REFERENCES auth.users(id);

-- Create the tuition_requests table
CREATE TABLE public.tuition_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    parent_id UUID REFERENCES auth.users(id),
    phone_number TEXT,
    student_name TEXT,
    grade TEXT,
    subjects TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security for tuition_requests
ALTER TABLE public.tuition_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Parents can view their own tuition requests
CREATE POLICY "Parents can view their own tuition requests"
ON public.tuition_requests FOR SELECT
USING (auth.uid() = parent_id);

-- Policy: Parents can create tuition requests
CREATE POLICY "Parents can create tuition requests"
ON public.tuition_requests FOR INSERT
WITH CHECK (auth.uid() = parent_id);

-- Policy: Parents can update their own tuition requests
CREATE POLICY "Parents can update their own tuition requests"
ON public.tuition_requests FOR UPDATE
USING (auth.uid() = parent_id);