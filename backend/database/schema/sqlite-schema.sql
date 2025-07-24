CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "personal_access_tokens"(
  "id" integer primary key autoincrement not null,
  "tokenable_type" varchar not null,
  "tokenable_id" integer not null,
  "name" varchar not null,
  "token" varchar not null,
  "abilities" text,
  "last_used_at" datetime,
  "expires_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens"(
  "tokenable_type",
  "tokenable_id"
);
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens"(
  "token"
);
CREATE TABLE IF NOT EXISTS "permissions"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "permissions_name_guard_name_unique" on "permissions"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "roles"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "roles_name_guard_name_unique" on "roles"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "model_has_permissions"(
  "permission_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  primary key("permission_id", "model_id", "model_type")
);
CREATE INDEX "model_has_permissions_model_id_model_type_index" on "model_has_permissions"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "model_has_roles"(
  "role_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("role_id", "model_id", "model_type")
);
CREATE INDEX "model_has_roles_model_id_model_type_index" on "model_has_roles"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "role_has_permissions"(
  "permission_id" integer not null,
  "role_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("permission_id", "role_id")
);
CREATE TABLE IF NOT EXISTS "documents"(
  "id" varchar not null,
  "document_type" varchar not null,
  "resident_id" integer not null,
  "applicant_name" varchar not null,
  "purpose" text not null,
  "applicant_address" text,
  "applicant_contact" varchar,
  "applicant_email" varchar,
  "priority" varchar not null,
  "needed_date" date,
  "processing_fee" numeric not null default('0'),
  "status" varchar not null default('pending'),
  "payment_status" varchar not null default 'paid',
  "document_number" varchar,
  "serial_number" varchar,
  "request_date" datetime not null default(CURRENT_TIMESTAMP),
  "processed_date" datetime,
  "approved_date" datetime,
  "released_date" datetime,
  "clearance_purpose" varchar,
  "clearance_type" varchar,
  "business_name" varchar,
  "business_type" varchar,
  "business_address" text,
  "business_owner" varchar,
  "indigency_reason" text,
  "monthly_income" numeric,
  "family_size" integer,
  "residency_period" varchar,
  "previous_address" text,
  "requirements_submitted" text,
  "notes" text,
  "remarks" text,
  "certifying_official" varchar,
  "processed_by" integer,
  "approved_by" integer,
  "released_by" integer,
  "expiry_date" date,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("released_by") references users("id") on delete set null on update no action,
  foreign key("approved_by") references users("id") on delete set null on update no action,
  foreign key("processed_by") references users("id") on delete set null on update no action,
  foreign key("resident_id") references residents("id") on delete cascade on update no action,
  primary key("id")
);
CREATE UNIQUE INDEX "documents_document_number_unique" on "documents"(
  "document_number"
);
CREATE INDEX "documents_document_type_status_index" on "documents"(
  "document_type",
  "status"
);
CREATE INDEX "documents_payment_status_index" on "documents"("payment_status");
CREATE INDEX "documents_request_date_index" on "documents"("request_date");
CREATE INDEX "documents_resident_id_document_type_index" on "documents"(
  "resident_id",
  "document_type"
);
CREATE UNIQUE INDEX "documents_serial_number_unique" on "documents"(
  "serial_number"
);
CREATE INDEX "documents_status_index" on "documents"("status");
CREATE TABLE IF NOT EXISTS "residents"(
  "id" varchar not null,
  "first_name" varchar not null,
  "last_name" varchar not null,
  "middle_name" varchar,
  "suffix" varchar,
  "birth_date" date not null,
  "age" integer,
  "birth_place" varchar not null,
  "gender" varchar check("gender" in('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY')) not null,
  "civil_status" varchar check("civil_status" in('SINGLE', 'LIVE_IN', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED', 'ANNULLED', 'PREFER_NOT_TO_SAY')) not null,
  "nationality" varchar check("nationality" in('FILIPINO', 'AMERICAN', 'BRITISH', 'CANADIAN', 'AUSTRALIAN', 'OTHER')) not null,
  "religion" varchar check("religion" in('CATHOLIC', 'IGLESIA_NI_CRISTO', 'EVANGELICAL', 'PROTESTANT', 'ISLAM', 'BUDDHIST', 'HINDU', 'SEVENTH_DAY_ADVENTIST', 'JEHOVAHS_WITNESS', 'BORN_AGAIN_CHRISTIAN', 'ORTHODOX', 'JUDAISM', 'ATHEIST', 'AGLIPAYAN', 'OTHER', 'PREFER_NOT_TO_SAY')) not null,
  "educational_attainment" varchar check("educational_attainment" in('NO_FORMAL_EDUCATION', 'ELEMENTARY_UNDERGRADUATE', 'ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_UNDERGRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_UNDERGRADUATE', 'COLLEGE_GRADUATE', 'POST_GRADUATE', 'VOCATIONAL', 'OTHER')) not null,
  "employment_status" varchar check("employment_status" in('EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'OFW')) not null,
  "occupation" varchar,
  "employer" varchar,
  "mobile_number" varchar,
  "landline_number" varchar,
  "email_address" varchar,
  "region" varchar,
  "province" varchar,
  "city" varchar,
  "barangay" varchar,
  "house_number" varchar,
  "street" varchar,
  "complete_address" text not null,
  "mother_name" varchar,
  "father_name" varchar,
  "emergency_contact_name" varchar,
  "emergency_contact_number" varchar,
  "emergency_contact_relationship" varchar,
  "primary_id_type" varchar,
  "id_number" varchar,
  "philhealth_number" varchar,
  "sss_number" varchar,
  "tin_number" varchar,
  "voters_id_number" varchar,
  "voter_status" varchar check("voter_status" in('NOT_REGISTERED', 'REGISTERED', 'DECEASED', 'TRANSFERRED')) not null,
  "precinct_number" varchar,
  "medical_conditions" text,
  "allergies" text,
  "senior_citizen" tinyint(1) not null default '0',
  "person_with_disability" tinyint(1) not null default '0',
  "disability_type" varchar,
  "indigenous_people" tinyint(1) not null default '0',
  "indigenous_group" varchar,
  "four_ps_beneficiary" tinyint(1) not null default '0',
  "four_ps_household_id" varchar,
  "profile_photo_url" varchar,
  "status" varchar check("status" in('ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED')) not null default 'ACTIVE',
  "created_by" integer,
  "updated_by" integer,
  "created_at" datetime,
  "updated_at" datetime,
  "deleted_at" datetime,
  foreign key("created_by") references "users"("id") on delete set null,
  foreign key("updated_by") references "users"("id") on delete set null,
  primary key("id")
);
CREATE INDEX "residents_first_name_last_name_index" on "residents"(
  "first_name",
  "last_name"
);
CREATE INDEX "residents_gender_civil_status_index" on "residents"(
  "gender",
  "civil_status"
);
CREATE INDEX "residents_employment_status_educational_attainment_index" on "residents"(
  "employment_status",
  "educational_attainment"
);
CREATE INDEX "residents_senior_citizen_person_with_disability_indigenous_people_four_ps_beneficiary_index" on "residents"(
  "senior_citizen",
  "person_with_disability",
  "indigenous_people",
  "four_ps_beneficiary"
);
CREATE INDEX "residents_voter_status_precinct_number_index" on "residents"(
  "voter_status",
  "precinct_number"
);
CREATE INDEX "residents_birth_date_age_index" on "residents"(
  "birth_date",
  "age"
);
CREATE INDEX "residents_created_at_index" on "residents"("created_at");
CREATE INDEX "residents_status_senior_citizen_index" on "residents"(
  "status",
  "senior_citizen"
);
CREATE INDEX "residents_status_person_with_disability_index" on "residents"(
  "status",
  "person_with_disability"
);
CREATE INDEX "residents_barangay_status_index" on "residents"(
  "barangay",
  "status"
);
CREATE TABLE IF NOT EXISTS "households"(
  "id" varchar not null,
  "household_number" varchar,
  "household_type" varchar check("household_type" in('NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER')) not null default 'NUCLEAR',
  "head_resident_id" varchar,
  "house_number" varchar not null,
  "street_sitio" varchar not null,
  "barangay" varchar not null,
  "complete_address" text not null,
  "monthly_income" varchar check("monthly_income" in('BELOW_10000', 'RANGE_10000_25000', 'RANGE_25000_50000', 'RANGE_50000_100000', 'ABOVE_100000')),
  "primary_income_source" varchar,
  "four_ps_beneficiary" tinyint(1) not null default '0',
  "indigent_family" tinyint(1) not null default '0',
  "has_senior_citizen" tinyint(1) not null default '0',
  "has_pwd_member" tinyint(1) not null default '0',
  "house_type" varchar check("house_type" in('CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED')),
  "ownership_status" varchar check("ownership_status" in('OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER')),
  "has_electricity" tinyint(1) not null default '0',
  "has_water_supply" tinyint(1) not null default '0',
  "has_internet_access" tinyint(1) not null default '0',
  "status" varchar check("status" in('ACTIVE', 'INACTIVE', 'TRANSFERRED')) not null default 'ACTIVE',
  "remarks" text,
  "created_by" varchar,
  "updated_by" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("head_resident_id") references "residents"("id") on delete set null,
  foreign key("created_by") references "users"("id") on delete set null,
  foreign key("updated_by") references "users"("id") on delete set null,
  primary key("id")
);
CREATE INDEX "households_barangay_index" on "households"("barangay");
CREATE INDEX "households_household_type_index" on "households"(
  "household_type"
);
CREATE INDEX "households_monthly_income_index" on "households"(
  "monthly_income"
);
CREATE INDEX "households_house_type_index" on "households"("house_type");
CREATE INDEX "households_ownership_status_index" on "households"(
  "ownership_status"
);
CREATE INDEX "households_status_index" on "households"("status");
CREATE INDEX "households_four_ps_beneficiary_index" on "households"(
  "four_ps_beneficiary"
);
CREATE INDEX "households_indigent_family_index" on "households"(
  "indigent_family"
);
CREATE INDEX "households_has_senior_citizen_index" on "households"(
  "has_senior_citizen"
);
CREATE INDEX "households_has_pwd_member_index" on "households"(
  "has_pwd_member"
);
CREATE UNIQUE INDEX "households_household_number_unique" on "households"(
  "household_number"
);
CREATE TABLE IF NOT EXISTS "household_members"(
  "id" integer primary key autoincrement not null,
  "household_id" varchar not null,
  "resident_id" varchar not null,
  "relationship" varchar check("relationship" in('HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON', 'GRANDDAUGHTER', 'UNCLE', 'AUNT', 'NEPHEW', 'NIECE', 'COUSIN', 'IN_LAW', 'BOARDER', 'OTHER')) not null default 'OTHER',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("household_id") references "households"("id") on delete cascade,
  foreign key("resident_id") references "residents"("id") on delete cascade
);
CREATE UNIQUE INDEX "household_members_household_id_resident_id_unique" on "household_members"(
  "household_id",
  "resident_id"
);
CREATE INDEX "household_members_household_id_index" on "household_members"(
  "household_id"
);
CREATE INDEX "household_members_resident_id_index" on "household_members"(
  "resident_id"
);
CREATE INDEX "household_members_relationship_index" on "household_members"(
  "relationship"
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" varchar not null,
  "username" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "first_name" varchar not null,
  "last_name" varchar not null,
  "middle_name" varchar,
  "phone" varchar not null,
  "role" varchar check("role" in('SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'BARANGAY_COUNCILOR', 'BARANGAY_CLERK', 'HEALTH_WORKER', 'SOCIAL_WORKER', 'SECURITY_OFFICER', 'DATA_ENCODER', 'VIEWER')) not null,
  "department" varchar check("department" in('ADMINISTRATION', 'HEALTH_SERVICES', 'SOCIAL_SERVICES', 'SECURITY_PUBLIC_SAFETY', 'FINANCE_TREASURY', 'RECORDS_MANAGEMENT', 'COMMUNITY_DEVELOPMENT', 'DISASTER_RISK_REDUCTION', 'ENVIRONMENTAL_MANAGEMENT', 'YOUTH_SPORTS_DEVELOPMENT', 'SENIOR_CITIZEN_AFFAIRS', 'WOMENS_AFFAIRS', 'BUSINESS_PERMITS', 'INFRASTRUCTURE_DEVELOPMENT')) not null,
  "position" varchar,
  "employee_id" varchar,
  "is_active" tinyint(1) not null default '1',
  "is_verified" tinyint(1) not null default '0',
  "last_login_at" datetime,
  "notes" text,
  "resident_id" integer,
  "created_by" integer,
  "updated_by" integer,
  "created_at" datetime,
  "updated_at" datetime,
  "deleted_at" datetime,
  foreign key("resident_id") references "residents"("id") on delete set null,
  foreign key("created_by") references "users"("id") on delete set null,
  foreign key("updated_by") references "users"("id") on delete set null,
  primary key("id")
);
CREATE INDEX "users_role_department_index" on "users"("role", "department");
CREATE INDEX "users_is_active_is_verified_index" on "users"(
  "is_active",
  "is_verified"
);
CREATE INDEX "users_last_login_at_index" on "users"("last_login_at");
CREATE INDEX "users_resident_id_index" on "users"("resident_id");
CREATE UNIQUE INDEX "users_username_unique" on "users"("username");
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE UNIQUE INDEX "users_employee_id_unique" on "users"("employee_id");
CREATE TABLE IF NOT EXISTS "audits"(
  "id" integer primary key autoincrement not null,
  "action_type" varchar,
  "user_id" integer,
  "event" varchar,
  "auditable_type" varchar not null,
  "auditable_id" integer not null,
  "table_name" varchar,
  "record_id" varchar,
  "description" varchar,
  "old_values" text,
  "new_values" text,
  "url" text,
  "ip_address" varchar,
  "user_agent" varchar,
  "tags" varchar,
  "timestamp" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "audits_auditable_type_auditable_id_index" on "audits"(
  "auditable_type",
  "auditable_id"
);
CREATE INDEX "audits_user_id_user_type_index" on "audits"(
  "user_id"
);
CREATE TABLE IF NOT EXISTS "barangay_officials"(
  "id" varchar not null,
  "resident_id" varchar not null,
  "prefix" varchar check("prefix" in('Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Hon.')) not null,
  "position" varchar check("position" in('BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'KAGAWAD', 'SK_CHAIRPERSON', 'SK_KAGAWAD', 'BARANGAY_CLERK', 'BARANGAY_TANOD')) not null,
  "committee_assignment" varchar check("committee_assignment" in('Health', 'Education', 'Public Safety', 'Environment', 'Peace and Order', 'Sports and Recreation', 'Women and Family', 'Senior Citizens')) not null,
  "term_start" date not null,
  "term_end" date not null,
  "term_number" integer,
  "is_current_term" tinyint(1) not null default '1',
  "status" varchar check("status" in('ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'DECEASED')) not null default 'ACTIVE',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("resident_id") references "residents"("id"),
  primary key("id")
);
CREATE INDEX "barangay_officials_position_index" on "barangay_officials"(
  "position"
);
CREATE INDEX "barangay_officials_status_index" on "barangay_officials"(
  "status"
);
CREATE INDEX "barangay_officials_term_start_term_end_index" on "barangay_officials"(
  "term_start",
  "term_end"
);
CREATE TABLE IF NOT EXISTS "tickets"(
  "id" varchar not null,
  "ticket_number" varchar not null,
  "subject" varchar not null,
  "description" text not null,
  "priority" varchar check("priority" in('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) not null,
  "requester_name" varchar,
  "resident_id" varchar,
  "contact_number" varchar,
  "email_address" varchar,
  "complete_address" varchar,
  "category" varchar check("category" in('APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION')) not null,
  "status" varchar check("status" in('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED')) not null default 'OPEN',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("resident_id") references "residents"("id") on delete set null,
  primary key("id")
);
CREATE INDEX "tickets_category_index" on "tickets"("category");
CREATE INDEX "tickets_status_index" on "tickets"("status");
CREATE INDEX "tickets_created_at_index" on "tickets"("created_at");
CREATE UNIQUE INDEX "tickets_ticket_number_unique" on "tickets"(
  "ticket_number"
);
CREATE TABLE IF NOT EXISTS "appointments"(
  "id" varchar not null,
  "base_ticket_id" varchar not null,
  "department" varchar check("department" in('ADMINISTRATION', 'HEALTH_SERVICES', 'SOCIAL_SERVICES', 'SECURITY_PUBLIC_SAFETY', 'FINANCE_TREASURY', 'RECORDS_MANAGEMENT', 'COMMUNITY_DEVELOPMENT', 'DISASTER_RISK_REDUCTION', 'ENVIRONMENTAL_MANAGEMENT', 'YOUTH_SPORTS_DEVELOPMENT', 'SENIOR_CITIZEN_AFFAIRS', 'WOMENS_AFFAIRS', 'BUSINESS_PERMITS', 'INFRASTRUCTURE_DEVELOPMENT')) not null,
  "date" date not null,
  "time" time not null,
  "additional_notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("base_ticket_id") references "tickets"("id") on delete cascade on update cascade,
  primary key("id")
);
CREATE UNIQUE INDEX "appointments_base_ticket_id_unique" on "appointments"(
  "base_ticket_id"
);
CREATE INDEX "appointments_department_index" on "appointments"("department");
CREATE INDEX "appointments_date_index" on "appointments"("date");
CREATE INDEX "appointments_date_time_index" on "appointments"("date", "time");
CREATE TABLE IF NOT EXISTS "blotters"(
  "id" varchar not null,
  "base_ticket_id" varchar not null,
  "type_of_incident" varchar check("type_of_incident" in('THEFT', 'PHYSICAL_ASSAULT', 'VERBAL_ASSAULT', 'PROPERTY_DAMAGE', 'DISTURBANCE', 'TRESPASSING', 'FRAUD', 'HARASSMENT', 'DOMESTIC_DISPUTE', 'NOISE_COMPLAINT', 'OTHER')) not null,
  "date_of_incident" date not null,
  "time_of_incident" varchar check("time_of_incident" in('08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00')) not null,
  "location_of_incident" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("base_ticket_id") references "tickets"("id") on delete cascade on update cascade,
  primary key("id")
);
CREATE INDEX "blotters_base_ticket_id_index" on "blotters"("base_ticket_id");
CREATE TABLE IF NOT EXISTS "other_people_involved"(
  "id" varchar not null,
  "blotter_id" varchar not null,
  "full_name" varchar not null,
  "address" varchar,
  "contact_number" varchar not null,
  "involvement" varchar check("involvement" in('RESPONDENT', 'WITNESS', 'VICTIM', 'SUSPECT')) not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("blotter_id") references "blotters"("id") on delete cascade,
  primary key("id")
);
CREATE INDEX "other_people_involved_blotter_id_index" on "other_people_involved"(
  "blotter_id"
);
CREATE TABLE IF NOT EXISTS "supporting_documents"(
  "id" varchar not null,
  "blotter_id" varchar not null,
  "url" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("blotter_id") references "blotters"("id") on delete cascade,
  primary key("id")
);
CREATE INDEX "supporting_documents_blotter_id_index" on "supporting_documents"(
  "blotter_id"
);
CREATE TABLE IF NOT EXISTS "complaints"(
  "id" varchar not null,
  "base_ticket_id" varchar not null,
  "c_category" varchar check("c_category" in('PUBLIC_SERVICES', 'INFRASTRUCTURE', 'SOCIAL_WELFARE', 'PUBLIC_SAFETY', 'HEALTH_SERVICES', 'ENVIRONMENTAL', 'EDUCATION', 'BUSINESS_PERMITS', 'COMMUNITY_PROGRAMS', 'OTHERS')) not null,
  "department" varchar check("department" in('ADMINISTRATION', 'HEALTH_SERVICES', 'SOCIAL_SERVICES', 'SECURITY_PUBLIC_SAFETY', 'FINANCE_TREASURY', 'RECORDS_MANAGEMENT', 'COMMUNITY_DEVELOPMENT', 'DISASTER_RISK_REDUCTION', 'ENVIRONMENTAL_MANAGEMENT', 'YOUTH_SPORTS_DEVELOPMENT', 'SENIOR_CITIZEN_AFFAIRS', 'WOMENS_AFFAIRS', 'BUSINESS_PERMITS', 'INFRASTRUCTURE_DEVELOPMENT')) not null,
  "location" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("base_ticket_id") references "tickets"("id") on delete cascade on update cascade,
  primary key("id")
);
CREATE INDEX "complaints_base_ticket_id_index" on "complaints"(
  "base_ticket_id"
);
CREATE INDEX "complaints_c_category_index" on "complaints"("c_category");
CREATE INDEX "complaints_department_index" on "complaints"("department");
CREATE TABLE IF NOT EXISTS "agendas"(
  "id" varchar not null,
  "title" varchar not null,
  "description" text,
  "date" date not null,
  "time" time not null,
  "end_time" time,
  "duration_minutes" integer default '60',
  "category" varchar check("category" in('MEETING', 'REVIEW', 'PRESENTATION', 'EVALUATION', 'BUDGET', 'PLANNING', 'INSPECTION', 'OTHER')) not null default 'MEETING',
  "priority" varchar check("priority" in('LOW', 'NORMAL', 'HIGH', 'URGENT')) not null default 'NORMAL',
  "status" varchar check("status" in('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED')) not null default 'SCHEDULED',
  "location" varchar,
  "venue" varchar,
  "participants" text,
  "organizer" varchar,
  "notes" text,
  "attachments" text,
  "reminder_enabled" tinyint(1) not null default '1',
  "reminder_minutes_before" integer not null default '15',
  "created_by" integer,
  "updated_by" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("created_by") references "users"("id") on delete set null,
  foreign key("updated_by") references "users"("id") on delete set null,
  primary key("id")
);
CREATE INDEX "agendas_date_time_index" on "agendas"("date", "time");
CREATE INDEX "agendas_category_index" on "agendas"("category");
CREATE INDEX "agendas_priority_index" on "agendas"("priority");
CREATE INDEX "agendas_status_index" on "agendas"("status");
CREATE INDEX "agendas_created_by_index" on "agendas"("created_by");

INSERT INTO migrations VALUES(1,'2025_06_13_000000_create_cache_table',1);
INSERT INTO migrations VALUES(2,'2025_06_14_115448_create_personal_access_tokens_table',1);
INSERT INTO migrations VALUES(3,'2025_06_18_031853_create_permission_tables',1);
INSERT INTO migrations VALUES(4,'2025_06_19_061240_create_documents_table',1);
INSERT INTO migrations VALUES(5,'2025_06_30_071259_update_documents_payment_status_default',1);
INSERT INTO migrations VALUES(6,'2025_06_30_072121_update_documents_payment_status',1);
INSERT INTO migrations VALUES(7,'2025_06_30_072331_change_documents_payment_status_default',1);
INSERT INTO migrations VALUES(8,'2025_07_01_010924_create_residents_table',1);
INSERT INTO migrations VALUES(9,'2025_07_01_014337_create_households_table',1);
INSERT INTO migrations VALUES(10,'2025_07_01_014509_create_household_members_table',1);
INSERT INTO migrations VALUES(11,'2025_07_01_022726_create_users_table',1);
INSERT INTO migrations VALUES(12,'2025_07_01_091247_create_audits_table',1);
INSERT INTO migrations VALUES(13,'2025_07_01_114520_create_barangay_officials_table',1);
INSERT INTO migrations VALUES(14,'2025_07_03_004217_create_tickets_table',1);
INSERT INTO migrations VALUES(15,'2025_07_03_004233_create_appointments_table',1);
INSERT INTO migrations VALUES(16,'2025_07_06_105940_create_blotters_table',1);
INSERT INTO migrations VALUES(17,'2025_07_06_105957_create_other_people_involved_table',1);
INSERT INTO migrations VALUES(18,'2025_07_06_110015_create_supporting_documents_table',1);
INSERT INTO migrations VALUES(19,'2025_07_06_151834_create_complaints_table',1);
INSERT INTO migrations VALUES(20,'2025_07_07_041745_create_agendas_table',2);
