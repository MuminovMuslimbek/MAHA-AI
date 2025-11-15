-- Add token_price column to current_affairs table
ALTER TABLE current_affairs 
ADD COLUMN token_price integer NOT NULL DEFAULT 1 CHECK (token_price > 0 AND token_price <= 10);

COMMENT ON COLUMN current_affairs.token_price IS 'Number of tokens required to unlock premium content (1-10 tokens)';