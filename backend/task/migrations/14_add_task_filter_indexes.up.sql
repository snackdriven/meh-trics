-- Improve filtering performance by indexing commonly filtered columns
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_energy_level ON tasks(energy_level);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

