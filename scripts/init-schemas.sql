-- Tạo 4 schemas riêng biệt cho 4 services
-- Mỗi service chỉ đọc/ghi schema của mình

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS account;
CREATE SCHEMA IF NOT EXISTS transaction;
CREATE SCHEMA IF NOT EXISTS notification;

-- Grant permissions cho user novapay
GRANT ALL ON SCHEMA auth TO novapay;
GRANT ALL ON SCHEMA account TO novapay;
GRANT ALL ON SCHEMA transaction TO novapay;
GRANT ALL ON SCHEMA notification TO novapay;
