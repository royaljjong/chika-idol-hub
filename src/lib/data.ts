import { ChikaDataset, ChikaLiveDataset, ChikaNotice as ChikaNoticeSchema, GravureFeature as GravureFeatureSchema, MetricDataset } from './schema';
import type { ChikaGroup, ChikaMember, ChikaNotice, GravureFeature, RegionId, DistrictId } from './schema';
import { z } from 'zod';
import groupsData from '../../data/chika-groups.json';
import noticesData from '../../data/chika-notices.json';
import gravureData from '../../data/chika-gravure.json';
import liveData from '../../data/chika-live.json';
import metricsData from '../../data/chika-metrics.json';

const groups: ChikaGroup[] = ChikaDataset.parse(groupsData);
const notices: ChikaNotice[] = z.array(ChikaNoticeSchema).parse(noticesData);
const gravures: GravureFeature[] = z.array(GravureFeatureSchema).parse(gravureData);
const live = ChikaLiveDataset.parse(liveData);
const metrics = MetricDataset.parse(metricsData);
const activeGroups = groups
  .filter((group) => (group.activityStatus ?? 'active') === 'active')
  .map((group) => ({ ...group, members: group.members.filter((member) => (member.activityStatus ?? 'active') === 'active') }));

export function getGroups(): ChikaGroup[] {
  return [...activeGroups];
}

export function getGroup(id: string): ChikaGroup | undefined {
  return activeGroups.find((g) => g.id === id);
}

export function getGroupsByRegion(region: RegionId): ChikaGroup[] {
  return activeGroups.filter((g) => g.region === region);
}

export function getGroupsByDistrict(district: DistrictId): ChikaGroup[] {
  return activeGroups.filter((g) => g.district === district);
}

export function getAllMembers(): ChikaMember[] {
  return activeGroups.flatMap((g) => g.members);
}

export function getMember(id: string): { member: ChikaMember; group: ChikaGroup } | undefined {
  for (const group of activeGroups) {
    const member = group.members.find((m) => m.id === id);
    if (member) {
      return { member, group };
    }
  }
  return undefined;
}

export function getNotices(): ChikaNotice[] {
  return notices.filter((notice) => notice.checkedAt && notice.sourceUrl);
}

export function getGravureFeatures(): GravureFeature[] {
  return gravures.filter((feature) => feature.checkedAt && feature.sourceUrl && feature.rightsStatus).map((feature) => ({
    ...feature,
    agency: feature.agency ?? groups.find((group) => group.id === feature.groupId)?.agency,
  }));
}

export function getLiveData() {
  return live;
}

export function getMetricSnapshots() {
  return [...metrics.snapshots];
}

// 생일 캘린더 (오늘 & 이번 달/다음 달 생일 아이돌 정렬)
export function getUpcomingBirthdays(): Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> {
  const membersWithBirthday: Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> = [];

  for (const group of activeGroups) {
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

export type RankCategory = 'popularity' | 'followers' | 'search';

// 전체 아이돌 랭킹 (인기 순위 / 팔로우 순위 / 검색량(이슈) 순위)
export function getAllRankedMembers(sortType: RankCategory = 'popularity'): Array<{ member: ChikaMember; group: ChikaGroup; scoreValue: number; formattedScore: string }> {
  const list: Array<{ member: ChikaMember; group: ChikaGroup; scoreValue: number; formattedScore: string }> = [];

  for (const group of activeGroups) {
    for (const member of group.members) {
      if (!member.metricsVerifiedAt || !member.metricsSourceUrl) continue;
      let score = 0;
      let formatted = '';

      if (sortType === 'followers') {
        score = (member.xFollowers || 0) + (member.igFollowers || 0);
        formatted = score >= 10000 ? `${(score / 10000).toFixed(1)}만` : score.toLocaleString();
      } else if (sortType === 'search') {
        // 검색량 / 트렌드 지수
        score = member.searchVolumeScore || 80;
        formatted = `${score}pt`;
      } else {
        // 인기 순위 (종합 인기 지수)
        score = member.popularityScore || 85;
        formatted = `${score}점`;
      }

      list.push({ member, group, scoreValue: score, formattedScore: formatted });
    }
  }

  return list.sort((a, b) => b.scoreValue - a.scoreValue);
}

// 특정 그룹 내의 멤버 랭킹 (그룹 내 인기 / 팔로우 / 검색량 순위)
export function getGroupRankedMembers(group: ChikaGroup, sortType: RankCategory = 'popularity'): Array<{ member: ChikaMember; scoreValue: number; formattedScore: string }> {
  const list = group.members.filter((member) => member.metricsVerifiedAt && member.metricsSourceUrl).map((member) => {
    let score = 0;
    let formatted = '';

    if (sortType === 'followers') {
      score = (member.xFollowers || 0) + (member.igFollowers || 0);
      formatted = score >= 10000 ? `${(score / 10000).toFixed(1)}만` : score.toLocaleString();
    } else if (sortType === 'search') {
      score = member.searchVolumeScore || 80;
      formatted = `${score}pt`;
    } else {
      score = member.popularityScore || 85;
      formatted = `${score}점`;
    }

    return { member, scoreValue: score, formattedScore: formatted };
  });

  return list.sort((a, b) => b.scoreValue - a.scoreValue);
}
