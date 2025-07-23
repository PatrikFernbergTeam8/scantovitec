-- Performance indexes for Scantovitec dashboard queries
-- Run these to improve query performance

-- Index on Kunder table for Kedja filtering
CREATE NONCLUSTERED INDEX IX_Kunder_Kedja 
ON Kunder (Kedja) 
INCLUDE (CrmID, Ort);

-- Index on Logs table for date filtering and joins
CREATE NONCLUSTERED INDEX IX_Logs_CrmID_LogDate 
ON Logs (CrmID, LogDate) 
INCLUDE (AntalSidor);

-- Index on Logs table for date-only filtering
CREATE NONCLUSTERED INDEX IX_Logs_LogDate_CrmID 
ON Logs (LogDate, CrmID) 
INCLUDE (AntalSidor);

-- Composite index for the main query pattern
CREATE NONCLUSTERED INDEX IX_Logs_LogDate_AntalSidor_CrmID 
ON Logs (LogDate) 
INCLUDE (AntalSidor, CrmID);