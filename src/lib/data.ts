import type { ChikaGroup, ChikaMember, ChikaNotice, GravureFeature, RegionId, DistrictId } from './schema';
import groupsData from '../../data/chika-groups.json';
import noticesData from '../../data/chika-notices.json';
import gravureData from '../../data/chika-gravure.json';

const groups: ChikaGroup[] = (groupsData as unknown as ChikaGroup[]) || [];
const notices: ChikaNotice[] = (noticesData as unknown as ChikaNotice[]) || [];
const gravures: GravureFeature[] = (gravureData as unknown as GravureFeature[]) || [];

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

export function getNotices(): ChikaNotice[] {
  return [...notices];
}

export function getGravureFeatures(): GravureFeature[] {
  return [...gravures];
}

// 생일 캘린더 (오늘 & 이번 달/다음 달 생일 아이돌 정렬)
export function getUpcomingBirthdays(): Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> {
  const membersWithBirthday: Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> = [];

  for (const group of groups) {
    for (const member of group.members) {
      if (member.birthDate) {
        const parts = member.birthDate.split('-');
        if (parts.length === 3 && parts[1] && parts[2]) {
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          if (!isNaN(month) && !isNaN(day)) {
            membersWithBirthday.push({
              member,
              group,
              birthDate: member.birthDate,
              month,
              day,
            });
          }
        }
      }
    }
  }

  return membersWithBirthday.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}

// SNS 팔로워 순위 랭킹
export function getTopFollowerRanking(): Array<{ member: ChikaMember; group: ChikaGroup; totalFollowers: number }> {
  const list: Array<{ member: ChikaMember; group: ChikaGroup; totalFollowers: number }> = [];

  for (const group of groups) {
    for (const member of group.members) {
      const total = (member.xFollowers || 0) + (member.igFollowers || 0);
      list.push({ member, group, totalFollowers: total });
    }
  }

  return list.sort((a, b) => b.totalFollowers - a.totalFollowers);
}
