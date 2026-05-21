import type { OsImageTemplate } from './types';

export const OS_IMAGE_CATALOG: OsImageTemplate[] = [
  {
    id: 'ubuntu-22.04',
    name: 'Ubuntu',
    family: 'linux',
    version: '22.04 LTS',
    description: 'Базовый образ для Linux-практик и DevOps',
    iconLabel: 'Ubuntu',
    minDiskGb: 20,
    recommendedCpu: 2,
    recommendedRamGb: 4,
  },
  {
    id: 'debian-12',
    name: 'Debian',
    family: 'linux',
    version: '12',
    description: 'Стабильная среда для сетевых и системных лабораторных',
    iconLabel: 'Debian',
    minDiskGb: 20,
    recommendedCpu: 2,
    recommendedRamGb: 2,
  },
  {
    id: 'windows-server-2022',
    name: 'Windows Server',
    family: 'windows',
    version: '2022',
    description: 'Active Directory, IIS и администрирование Windows',
    iconLabel: 'Win',
    minDiskGb: 40,
    recommendedCpu: 2,
    recommendedRamGb: 4,
  },
  {
    id: 'windows-10',
    name: 'Windows 10',
    family: 'windows',
    version: 'Pro',
    description: 'Клиентская ОС для прикладных и офисных заданий',
    iconLabel: 'Win10',
    minDiskGb: 50,
    recommendedCpu: 2,
    recommendedRamGb: 4,
  },
  {
    id: 'centos-stream-9',
    name: 'CentOS Stream',
    family: 'linux',
    version: '9',
    description: 'Enterprise Linux для практик по RHEL-стеку',
    iconLabel: 'CentOS',
    minDiskGb: 25,
    recommendedCpu: 2,
    recommendedRamGb: 4,
  },
  {
    id: 'vyos',
    name: 'VyOS',
    family: 'network',
    version: '1.5',
    description: 'Маршрутизация, firewall и сетевые лабораторные',
    iconLabel: 'VyOS',
    minDiskGb: 10,
    recommendedCpu: 1,
    recommendedRamGb: 2,
  },
];

export function findOsImage(id: string): OsImageTemplate | undefined {
  return OS_IMAGE_CATALOG.find((img) => img.id === id);
}
