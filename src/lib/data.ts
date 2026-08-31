import { ChikaDataset, ChikaLiveDataset, ChikaNotice as ChikaNoticeSchema, GeoAreaDataset, GravureFeature as GravureFeatureSchema, MetricDataset } from './schema';
import type { ChikaGroup, ChikaLiveEvent, ChikaMember, ChikaNotice, ChikaVenue, GeoArea, GravureFeature, RegionId, DistrictId } from './schema';
import { z } from 'zod';
import groupsData from '../../data/chika-groups.json';
import noticesData from '../../data/chika-notices.json';
import gravureData from '../../data/chika-gravure.json';
import liveData from '../../data/chika-live.json';
import geoAreaData from '../../data/chika-geo-areas.json';
import metricsData from '../../data/chika-metrics.json';
import { getJapanCalendarDate } from './japan-date';

const groups: ChikaGroup[] = ChikaDataset.parse(groupsData);
const notices: ChikaNotice[] = z.array(ChikaNoticeSchema).parse(noticesData);
const gravures: GravureFeature[] = z.array(GravureFeatureSchema).parse(gravureData);
const live = ChikaLiveDataset.parse(liveData);
const geoAreas = GeoAreaDataset.parse(geoAreaData).areas;
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

export function getGeoAreas(): GeoArea[] {
  return [...geoAreas];
}

export interface LiveEventView {
  event: ChikaLiveEvent;
  groups: ChikaGroup[];
  venue: ChikaVenue | null;
}

function toLiveEventView(event: ChikaLiveEvent): LiveEventView {
  return {
    event,
    groups: event.groupIds.map((groupId) => activeGroups.find((group) => group.id === groupId)).filter((group): group is ChikaGroup => Boolean(group)),
    venue: event.venueId ? live.venues.find((venue) => venue.id === event.venueId) ?? null : null,
  };
}

export function getLiveEvents(): LiveEventView[] {
  return [...live.events]
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn))
    .map(toLiveEventView);
}

export function getLiveEvent(id: string): LiveEventView | undefined {
  const event = live.events.find((item) => item.id === id);
  return event ? toLiveEventView(event) : undefined;
}

export function getUpcomingLiveEventsForGroup(groupId: string, today = getJapanCalendarDate()): LiveEventView[] {
  return getLiveEvents().filter(({ event }) => event.groupIds.includes(groupId) && (event.endsOn ?? event.startsOn) >= today && event.status === 'scheduled');
}

export function getMetricSnapshots() {
  return [...metrics.snapshots];
}

// 생일 캘린더 (오늘 & 이번 달/다음 달 생일 아이돌 정렬)
export function getUpcomingBirthdays(): Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> {
  const membersWithBirthday: Array<{ member: ChikaMember; group: ChikaGroup; birthDate: string; month: number; day: number }> = [];

  for (const group of activeGroups) {
    for (const member of group.members) {
      const knownBirthday = member.birthDate ?? member.birthMonthDay;
      if (knownBirthday) {
        const parts = knownBirthday.split('-');
        const monthPart = parts.at(-2);
        const dayPart = parts.at(-1);
        if (monthPart && dayPart) {
          const month = parseInt(monthPart, 10);
          const day = parseInt(dayPart, 10);
          if (!isNaN(month) && !isNaN(day)) {
            membersWithBirthday.push({
              member,
              group,
              birthDate: knownBirthday,
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
        if (member.searchVolumeScore === undefined) continue;
        score = member.searchVolumeScore;
        formatted = `${score}pt`;
      } else {
        // 인기 순위 (종합 인기 지수)
        if (member.popularityScore === undefined) continue;
        score = member.popularityScore;
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
      score = member.searchVolumeScore ?? -1;
      formatted = `${score}pt`;
    } else {
      score = member.popularityScore ?? -1;
      formatted = `${score}점`;
    }

    return { member, scoreValue: score, formattedScore: formatted };
  }).filter((item) => item.scoreValue >= 0);

  return list.sort((a, b) => b.scoreValue - a.scoreValue);
}
