-- User Reports Table Migration
-- This migration adds a generic reporting system for petitions and signatures

-- =============================================================================
-- USER REPORTS TABLE
-- =============================================================================

-- User reports table for reporting inappropriate content
CREATE TABLE IF NOT EXISTS user_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_user_id TEXT NOT NULL, -- User who made the report
    reported_item_type TEXT CHECK(reported_item_type IN ('petition', 'signature')) NOT NULL,
    reported_item_id INTEGER NOT NULL, -- ID of the petition or signature being reported
    report_reason TEXT CHECK(report_reason IN (
        'spam', 
        'inappropriate_content', 
        'harassment', 
        'misinformation', 
        'hate_speech', 
        'violence', 
        'copyright_violation',
        'other'
    )) NOT NULL,
    report_description TEXT, -- Optional detailed description
    status TEXT CHECK(status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    admin_notes TEXT, -- Notes from admin/moderator review
    reviewed_by TEXT, -- Admin user who reviewed the report
    reviewed_at DATETIME, -- When the report was reviewed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Prevent duplicate reports from same user for same item
    UNIQUE(reporter_user_id, reported_item_type, reported_item_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_item ON user_reports(reported_item_type, reported_item_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_user_reports_reviewed_by ON user_reports(reviewed_by);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER IF NOT EXISTS update_user_reports_updated_at
AFTER UPDATE ON user_reports
BEGIN
    UPDATE user_reports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
