-- Enhanced Database Schema for Advanced Recommendation System
-- Add these tables to support comprehensive user behavior tracking and ML recommendations

-- User Signals Table - Core tracking table for all user interactions
CREATE TABLE IF NOT EXISTS user_signals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    work_id VARCHAR(255),
    author_id VARCHAR(255),
    signal_type VARCHAR(50) NOT NULL,
    value DECIMAL(5,4) NOT NULL, -- Normalized value -1 to 1
    metadata JSONB, -- Flexible metadata storage
    session_id VARCHAR(255),
    device_type VARCHAR(20),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Indexes for fast querying
    INDEX idx_user_signals_user_id (user_id),
    INDEX idx_user_signals_work_id (work_id),
    INDEX idx_user_signals_signal_type (signal_type),
    INDEX idx_user_signals_timestamp (timestamp),
    INDEX idx_user_signals_composite (user_id, signal_type, timestamp)
);

-- User Profiles Table - Aggregated user preferences and behavior patterns  
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(255) PRIMARY KEY,
    genre_affinities JSONB, -- Genre preferences with scores
    format_preferences JSONB, -- Format preferences (novel, comic, etc.)
    reading_patterns JSONB, -- Session length, peak hours, completion rates
    social_engagement JSONB, -- Like/share/subscription patterns
    quality_preference DECIMAL(3,2) DEFAULT 0.5, -- 0-1 preference for high-quality content
    freshness_preference DECIMAL(3,2) DEFAULT 0.5, -- 0-1 preference for new content
    diversity_preference DECIMAL(3,2) DEFAULT 0.3, -- 0-1 openness to diverse content
    last_updated TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recommendation Cache Table - Cache computed recommendations for performance
CREATE TABLE IF NOT EXISTS recommendation_cache (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    work_id VARCHAR(255) NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reasons JSONB, -- Array of recommendation reasons
    algorithm_version VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_rec_cache_user_id (user_id),
    INDEX idx_rec_cache_score (score DESC),
    INDEX idx_rec_cache_expires (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- A/B Test Groups Table - Track which users are in which experiments
CREATE TABLE IF NOT EXISTS ab_test_groups (
    user_id VARCHAR(255) PRIMARY KEY,
    experiment_name VARCHAR(100) NOT NULL,
    group_name VARCHAR(50) NOT NULL, -- 'control', 'treatment_a', etc.
    assigned_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ab_experiment (experiment_name, group_name)
);

-- Content Similarity Matrix - Precomputed similarity scores between works
CREATE TABLE IF NOT EXISTS content_similarity (
    work_id_1 VARCHAR(255) NOT NULL,
    work_id_2 VARCHAR(255) NOT NULL,
    similarity_score DECIMAL(5,4) NOT NULL,
    similarity_type VARCHAR(50) NOT NULL, -- 'genre', 'content', 'collaborative'
    computed_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (work_id_1, work_id_2, similarity_type),
    INDEX idx_similarity_score (similarity_score DESC),
    
    FOREIGN KEY (work_id_1) REFERENCES works(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id_2) REFERENCES works(id) ON DELETE CASCADE
);

-- Trending Metrics Table - Track trending content for recommendations
CREATE TABLE IF NOT EXISTS trending_metrics (
    work_id VARCHAR(255) PRIMARY KEY,
    trending_score DECIMAL(5,4) NOT NULL,
    velocity_1h DECIMAL(8,4) DEFAULT 0, -- Engagement in last hour
    velocity_24h DECIMAL(8,4) DEFAULT 0, -- Engagement in last 24h  
    velocity_7d DECIMAL(8,4) DEFAULT 0, -- Engagement in last 7 days
    peak_time INTEGER, -- Hour of day when most active (0-23)
    last_updated TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
    INDEX idx_trending_score (trending_score DESC),
    INDEX idx_trending_velocity (velocity_24h DESC)
);

-- User Similarity Matrix - Precomputed user similarity for collaborative filtering
CREATE TABLE IF NOT EXISTS user_similarity (
    user_id_1 VARCHAR(255) NOT NULL,
    user_id_2 VARCHAR(255) NOT NULL,
    similarity_score DECIMAL(5,4) NOT NULL,
    common_interests INTEGER DEFAULT 0, -- Number of shared interests
    last_computed TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (user_id_1, user_id_2),
    INDEX idx_user_similarity_score (similarity_score DESC),
    
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
);

-- Search Analytics Table - Track search behavior for recommendation improvement
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER DEFAULT 0,
    clicked_results JSONB, -- Array of clicked work IDs with positions
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_search_user_id (user_id),
    INDEX idx_search_query (query),
    INDEX idx_search_timestamp (timestamp),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Recommendation Feedback Table - Track user interactions with recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    work_id VARCHAR(255) NOT NULL,
    recommendation_source VARCHAR(100) NOT NULL, -- 'algorithmic', 'trending', etc.
    action VARCHAR(50) NOT NULL, -- 'view', 'like', 'skip', 'block'
    recommendation_rank INTEGER, -- Position in recommendation list
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_work_id (work_id),
    INDEX idx_feedback_source (recommendation_source),
    INDEX idx_feedback_action (action),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- Enhanced Reading Sessions Table - Comprehensive reading behavior tracking
CREATE TABLE IF NOT EXISTS reading_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    work_id VARCHAR(255) NOT NULL,
    section_id VARCHAR(255),
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    duration_seconds INTEGER,
    words_read INTEGER DEFAULT 0,
    scroll_depth DECIMAL(3,2) DEFAULT 0, -- 0.0 to 1.0
    reading_speed INTEGER, -- Words per minute
    interactions JSONB, -- Array of interactions during session
    device_type VARCHAR(20),
    referrer VARCHAR(255), -- How user arrived at content
    
    INDEX idx_reading_sessions_user_id (user_id),
    INDEX idx_reading_sessions_work_id (work_id),
    INDEX idx_reading_sessions_duration (duration_seconds),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
);

-- Content Tags Table - Enhanced tagging for better content matching
CREATE TABLE IF NOT EXISTS content_tags (
    id SERIAL PRIMARY KEY,
    work_id VARCHAR(255) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50) NOT NULL, -- 'genre', 'theme', 'mood', 'style', 'auto_generated'
    confidence DECIMAL(3,2) DEFAULT 1.0, -- Confidence in tag relevance (0-1)
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(work_id, tag, tag_type),
    INDEX idx_content_tags_work_id (work_id),
    INDEX idx_content_tags_tag (tag),
    INDEX idx_content_tags_type (tag_type),
    
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- Recommendation Performance Metrics - Track algorithm effectiveness
CREATE TABLE IF NOT EXISTS recommendation_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    algorithm_version VARCHAR(20) NOT NULL,
    experiment_group VARCHAR(50),
    total_recommendations INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0, -- Rate of likes/bookmarks
    diversity_score DECIMAL(5,4) DEFAULT 0,
    user_satisfaction DECIMAL(5,4) DEFAULT 0,
    
    UNIQUE(date, algorithm_version, experiment_group),
    INDEX idx_rec_metrics_date (date),
    INDEX idx_rec_metrics_ctr (click_through_rate DESC)
);

-- Views for common recommendation queries

-- User Engagement Score View
CREATE OR REPLACE VIEW user_engagement_scores AS
SELECT 
    user_id,
    COUNT(DISTINCT CASE WHEN signal_type IN ('like', 'bookmark', 'subscribe') THEN work_id END) as engagement_actions,
    COUNT(DISTINCT work_id) as unique_works_viewed,
    AVG(CASE WHEN signal_type = 'view_duration' THEN value ELSE NULL END) as avg_session_length,
    AVG(CASE WHEN signal_type = 'completion_rate' THEN value ELSE NULL END) as avg_completion_rate,
    COUNT(*) as total_signals
FROM user_signals 
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Work Popularity Scores View  
CREATE OR REPLACE VIEW work_popularity_scores AS
SELECT 
    work_id,
    COUNT(DISTINCT user_id) as unique_viewers,
    COUNT(CASE WHEN signal_type = 'like' THEN 1 END) as total_likes,
    COUNT(CASE WHEN signal_type = 'bookmark' THEN 1 END) as total_bookmarks,
    AVG(CASE WHEN signal_type = 'completion_rate' THEN value ELSE NULL END) as avg_completion_rate,
    COUNT(CASE WHEN signal_type = 'view_start' THEN 1 END) as total_views,
    (COUNT(CASE WHEN signal_type = 'like' THEN 1 END)::FLOAT + 
     COUNT(CASE WHEN signal_type = 'bookmark' THEN 1 END)::FLOAT * 1.5) / 
     NULLIF(COUNT(CASE WHEN signal_type = 'view_start' THEN 1 END), 0) as engagement_rate
FROM user_signals
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY work_id;

-- Active Users Today View
CREATE OR REPLACE VIEW active_users_today AS
SELECT 
    user_id,
    COUNT(DISTINCT work_id) as works_viewed,
    MAX(timestamp) as last_activity,
    COUNT(*) as total_actions
FROM user_signals 
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY user_id;