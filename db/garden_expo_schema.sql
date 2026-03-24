-- 园林展会系统 MySQL Schema（示例）

CREATE TABLE IF NOT EXISTS app_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64) NOT NULL,
  avatar_url VARCHAR(512),
  signature VARCHAR(255),
  phone VARCHAR(32),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_app_user_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS content_banner (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(128) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  jump_url VARCHAR(512),
  sort_no INT NOT NULL DEFAULT 100,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1=启用,0=禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banner_status_sort (status, sort_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS content_activity (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(128) NOT NULL,
  summary VARCHAR(500),
  cover_url VARCHAR(512),
  detail_url VARCHAR(512),
  starts_at DATETIME,
  ends_at DATETIME,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1=上架,0=下架',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activity_status_time (status, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  sort_no INT NOT NULL DEFAULT 100,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  app_user_id BIGINT NOT NULL,
  activity_id BIGINT,
  category_id BIGINT NOT NULL,
  title VARCHAR(128) NOT NULL,
  description TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED/RETURNED',
  reject_reason VARCHAR(500),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewer_id BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_submission_user_time (app_user_id, submitted_at),
  INDEX idx_submission_status_time (status, submitted_at),
  INDEX idx_submission_activity (activity_id),
  CONSTRAINT fk_submission_user FOREIGN KEY (app_user_id) REFERENCES app_user(id),
  CONSTRAINT fk_submission_category FOREIGN KEY (category_id) REFERENCES submission_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_media (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  media_type VARCHAR(16) NOT NULL COMMENT 'IMAGE/VIDEO',
  media_url VARCHAR(512) NOT NULL,
  sort_no INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_submission (submission_id),
  CONSTRAINT fk_submission_media_submission FOREIGN KEY (submission_id) REFERENCES submission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS award_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  activity_id BIGINT,
  award_name VARCHAR(128) NOT NULL,
  quota INT NOT NULL DEFAULT 1,
  prize_desc VARCHAR(500),
  criteria_desc VARCHAR(500),
  sort_no INT NOT NULL DEFAULT 100,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_award_activity_status (activity_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  app_user_id BIGINT NOT NULL,
  ticket_code VARCHAR(64) NOT NULL UNIQUE,
  qr_content VARCHAR(512) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'UNUSED' COMMENT 'UNUSED/USED/EXPIRED',
  claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ticket_user_status (app_user_id, status),
  INDEX idx_ticket_expires_at (expires_at),
  CONSTRAINT fk_ticket_user FOREIGN KEY (app_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_verify_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  verify_result VARCHAR(16) NOT NULL COMMENT 'SUCCESS/FAILED',
  verifier_id BIGINT,
  verify_channel VARCHAR(32) COMMENT 'ADMIN/DOUYIN',
  remark VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_verify_ticket (ticket_id),
  CONSTRAINT fk_verify_ticket FOREIGN KEY (ticket_id) REFERENCES ticket(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  from_status VARCHAR(16),
  to_status VARCHAR(16) NOT NULL,
  reason VARCHAR(500),
  operator_id BIGINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_submission (submission_id),
  CONSTRAINT fk_audit_submission FOREIGN KEY (submission_id) REFERENCES submission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
