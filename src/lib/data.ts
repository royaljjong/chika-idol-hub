import type { ChikaGroup, ChikaMember, RegionId, DistrictId } from './schema';
import groupsData from '../../data/chika-groups.json';

const groups: ChikaGroup[] = (groupsData as unknown as ChikaGroup[]) || [];

export function getGroups(): ChikaGroup[] {
  return [...groups];
}

export function getGroup(id: string): ChikaGroup | undefined {
  return groups.find((g) => g.id === id);
}

export function getGroupsByRegion(region: RegionId): ChikaGroup[] {
  return groups.filter((g) => g.region === region);
}

export function getGroupsByDistrict(district: DistrictId): ChikaGroup[] {
  return groups.filter((g) => g.district === district);
}

export function getAllMembers(): ChikaMember[] {
  return groups.flatMap((g) => g.members);
}

export function getMember(id: string): { member: ChikaMember; group: ChikaGroup } | undefined {
  for (const group of groups) {
    const member = group.members.find((m) => m.id === id);
    if (member) {
      return { member, group };
    }
  }
  return undefined;
}
