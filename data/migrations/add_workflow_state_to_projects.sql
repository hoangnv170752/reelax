-- Add workflow_state column to projects table
ALTER TABLE projects ADD COLUMN workflow_state JSONB;

-- Comment on the column
COMMENT ON COLUMN projects.workflow_state IS 'Stores the serialized workflow canvas state (nodes, connections, positions) as JSON';
