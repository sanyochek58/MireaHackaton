import type { StandNetworkConfig } from '@/entities/network/types';

export function formatNetworkSummary(network: StandNetworkConfig): string {
  if (network.autoAssign) {
    return 'Автоназначение из пула';
  }
  const parts: string[] = [];
  if (network.vlan) parts.push(`VLAN ${network.vlan}`);
  if (network.subnet) parts.push(network.subnet);
  if (network.dns) parts.push(`DNS ${network.dns}`);
  return parts.length > 0 ? parts.join(' · ') : 'Не задано';
}

export function resolveAutoNetwork(userIndex: number): StandNetworkConfig {
  const vlan = String(100 + (userIndex % 50));
  const octet = userIndex % 200;
  return {
    autoAssign: true,
    vlan,
    subnet: `10.10.${octet}.0/24`,
    dns: '8.8.8.8',
  };
}

export function normalizeNetworkInput(
  input: StandNetworkConfig,
): StandNetworkConfig {
  if (input.autoAssign) {
    return { autoAssign: true };
  }
  return {
    autoAssign: false,
    vlan: input.vlan?.trim() || undefined,
    subnet: input.subnet?.trim() || undefined,
    dns: input.dns?.trim() || undefined,
  };
}

export function ipFromSubnet(subnet: string, hostOctet = 42): string {
  const base = subnet.split('/')[0] ?? '10.0.0.0';
  const parts = base.split('.');
  if (parts.length !== 4) return base;
  parts[3] = String(hostOctet);
  return parts.join('.');
}

export function finalizeNetworkForStand(
  input: StandNetworkConfig,
  userId: string,
): StandNetworkConfig {
  if (input.autoAssign) {
    const index = Math.abs(
      userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0),
    );
    return resolveAutoNetwork(index % 200);
  }
  return normalizeNetworkInput(input);
}

export function validateManualNetwork(network: StandNetworkConfig): string | null {
  if (network.autoAssign) return null;
  if (!network.subnet?.trim()) {
    return 'Укажите подсеть или включите автоназначение';
  }
  const cidr = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  if (!cidr.test(network.subnet.trim())) {
    return 'Подсеть в формате CIDR, например 10.10.0.0/24';
  }
  return null;
}
