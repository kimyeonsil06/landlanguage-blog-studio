import { describe, expect, it } from 'vitest';
import { displayBytes, incompleteCount, textMetrics } from '../src/lib/metrics.js';

describe('문자·바이트 계산', () => {
  it('표시용 바이트는 ASCII 1, 비ASCII 2로 계산한다', () => expect(displayBytes('A가')).toBe(3));
  it('공백 제외 통계를 계산한다', () => expect(textMetrics('가 A').noSpaces).toBe(2));
  it('미완성 자리표시를 센다', () => expect(incompleteCount('[확인 필요: 가격] [작성자 경험 입력: 방문일]')).toBe(2));
});
