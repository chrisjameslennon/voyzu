INSERT INTO app_user (
    code,
    email,
    display_name,
    password_hash,
    role,
    access_mode,
    show_developer_links,
    status,
    creation_actor_type,
    updated_actor_type
)
SELECT
    'ADMIN',
    NULL,
    'Admin',
    'scrypt:jbYcpACiD7EX7ne4nn5_Vg:tGptEjEwx5JTJf7m6LkTXEcNpPK2a4ZFIBR0J4Mn2O8_VFa08kzTKq7fAIeO2g89kMyM2H4qBNKi1Cn-0FJLNA',
    'ADMIN',
    'UI',
    true,
    'ACTIVE',
    'SYSTEM',
    'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1
    FROM app_user
);
