import { describe, expect, it } from 'vitest';
import { evaluationSchema } from '../server/schemas.js';

describe('AI 평가 스키마', () => {
  it('9개 항목이 아니면 거부한다', () => expect(evaluationSchema.safeParse({ items: [], total: 0, grade: 'x', topFixes: ['a','b','c'] }).success).toBe(false));
});
