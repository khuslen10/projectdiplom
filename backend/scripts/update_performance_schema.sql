-- Update performance_reviews table to ensure consistent status values
ALTER TABLE performance_reviews MODIFY COLUMN status ENUM('draft', 'submitted', 'acknowledged') NOT NULL DEFAULT 'draft';

-- Update any existing records with old status values
UPDATE performance_reviews SET status = 'submitted' WHERE status = 'pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_user_id ON performance_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_status ON performance_reviews(status);

-- Add a notification flag column to track if users have been notified about reviews
ALTER TABLE performance_reviews ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Add a last_updated column to track when reviews were last modified
ALTER TABLE performance_reviews ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add a comments_employee column for employee feedback on reviews
ALTER TABLE performance_reviews ADD COLUMN IF NOT EXISTS comments_employee TEXT;
