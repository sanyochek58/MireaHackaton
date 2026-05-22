# README.md

## Описание проекта
Шлюз оркестрации для безопасного использования виртуальных машин на платформе Киберинфраструктура.
---

## Конфигурация (.env)
Для запуска проекта создайте файл .env в корневой директории на основе примера ниже.

```
OPENSTACK_BASE_URL=https://your-openstack-url
OPENSTACK_PROJECT_ID=your-project-id
OPENSTACK_DOMAIN=your-domain
OPENSTACK_USERNAME=your-username
OPENSTACK_PASSWORD=your-password
OPENSTACK_PROJECT_NAME=your-project-name
OPENSTACK_DEFAULT_FLAVOR_ID=your-flavor-id
OPENSTACK_DEFAULT_IMAGE_ID=your-image-id
OPENSTACK_DEFAULT_NETWORK_ID=your-network-id
OPENSTACK_DEFAULT_SECURITY_GROUP=default
OPENSTACK_DEFAULT_VOLUME_SIZE_GB=150
OPENSTACK_POLL_INTERVAL_SECONDS=5
OPENSTACK_MAX_POLL_ATTEMPTS=120
OPENSTACK_INSECURE_SSL=true

SYSTEM_CPU_MIN=1
SYSTEM_RAM_MIN_GB=2
SYSTEM_DISK_MIN_GB=20
SYSTEM_DISK_MAX_GB=500
SYSTEM_TTL_MIN_HOURS=1
SYSTEM_TTL_MAX_HOURS=8
SYSTEM_TTL_DEFAULT_HOURS=2
SYSTEM_MAX_STANDS_FALLBACK=200
SYSTEM_METRICS_SNAPSHOT_INTERVAL_MS=60000
SYSTEM_METRICS_HISTORY_RETENTION_HOURS=24

CYBER_INFRA_BASE_URL=https://your-cyber-infra-url/api/v2
CYBER_INFRA_DOMAIN=your-domain
CYBER_INFRA_PROJECT_ID=your-project-id
CYBER_INFRA_DEFAULT_NETWORK_ID=00000000-0000-0000-0000-000000000000
CYBER_INFRA_BOOT_VOLUME_SIZE_GB=20```

EXTERNAL_API_BASE_URL=http://localhost:8081

JWT_SECRET=f7g9h2j4k6l8m0n2p4q6r8s0t2u4v6w8x0y2z4a6b8c0d2e4f6g8h0i2j4k6l8m0
JWT_EXPIRATION_MS=86400000

VITE_API_BASE_URL=/api
VITE_ENABLE_MSW=false

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/orchestrator
SPRING_DATASOURCE_USERNAME=your-db-user
SPRING_DATASOURCE_PASSWORD=your-db-password
```

После создания .env проект можно запустить командой:
```bash
docker-compose --env-file=.env up --build
```