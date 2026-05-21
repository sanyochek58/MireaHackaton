# REST API — Шлюз оркестрации стендов

Базовый URL: `VITE_API_BASE_URL` (по умолчанию `/api`).

Авторизация: `Authorization: Bearer <token>` для защищённых эндпоинтов.

## Публичные

### GET /system/metrics

```json
{
  "cpuPercent": 67,
  "ramPercent": 72,
  "activeStands": 18,
  "maxStands": 24,
  "canProvision": true
}
```

### GET /system/metrics/history?range=1h

```json
[
  { "timestamp": "2026-05-21T10:00:00Z", "cpuPercent": 55, "ramPercent": 60 }
]
```

### GET /system/images

Список доступных образов ОС для конфигуратора.

```json
[
  {
    "id": "ubuntu-22.04",
    "name": "Ubuntu",
    "family": "linux",
    "version": "22.04 LTS",
    "description": "...",
    "iconLabel": "Ubuntu",
    "minDiskGb": 20,
    "recommendedCpu": 2,
    "recommendedRamGb": 4
  }
]
```

### GET /system/limits

```json
{
  "cpuMin": 1,
  "cpuMax": 8,
  "ramMin": 2,
  "ramMax": 16,
  "diskMin": 20,
  "diskMax": 100,
  "ttlMinHours": 1,
  "ttlMaxHours": 8,
  "ttlDefaultHours": 2
}
```

`ttlDefaultHours` / `ttlMaxHours` могут зависеть от настроек жизненного цикла в админке.

## Auth

### POST /auth/register

Тело: `{ "email", "password", "fullName" }`  
Ответ: `{ "token", "user": { "id", "email", "fullName", "role" } }`

### POST /auth/login

Тело: `{ "email", "password" }`  
Ответ: как register.

## Student

### GET /stands/me

Текущий стенд или `null`.

### POST /stands/provision

Тело: `{ "templateId", "cpu", "ramGb", "diskGb", "ttlHours", "network" }` — образ, ресурсы, время аренды и сеть.

```json
"network": {
  "autoAssign": true
}
```

или вручную:

```json
"network": {
  "autoAssign": false,
  "vlan": "100",
  "subnet": "10.10.0.0/24",
  "dns": "8.8.8.8"
}
```

Ответ стенда (`GET /stands/me`) содержит поле `network` с итоговой конфигурацией (после автоназначения — заполненные vlan/subnet/dns).  
Ответ: `{ "standId", "taskId" }`

### POST /stands/me/freeze

Режим техподдержки. Ответ: объект стенда со `state: "frozen"`.

**FSM:** `allocating` → `deploying` → `ready` → (`frozen`) → `cleaning` → `idle`

## Admin

### GET /admin/users

### GET /admin/vms

### POST /admin/vms/:id/reboot

### POST /admin/vms/:id/power-off

### GET /admin/vms/:id/access-key

```json
{
  "vmId": "vm-1",
  "keyType": "ssh",
  "username": "student",
  "host": "10.10.0.15",
  "privateKey": "-----BEGIN ..."
}
```

### PUT /admin/users/:id/network

Тело: `{ "vlan?", "subnet?", "dns?" }`

### GET /admin/settings/lifecycle

### PUT /admin/settings/lifecycle

```json
{ "labTtlHours": 2, "freezeTtlHours": 24 }
```
