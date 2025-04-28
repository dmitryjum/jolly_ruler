import { z } from 'zod';

// TypeScript type for rules
export type RuleCondition =
  | { type: 'equals'; field: string; value: string | number | boolean }
  | { type: 'before'; field: string; compareToField: string }
  | { type: 'after'; field: string; compareToField: string }
  | { type: 'exists'; field: string }
  | { type: 'and'; conditions: RuleCondition[] }
  | { type: 'or'; conditions: RuleCondition[] };

// Zod schema to validate rule structures at runtime
export const ruleConditionSchema: z.ZodType<RuleCondition> = z.lazy(() =>
  z.union([
    z.object({
      type: z.literal('equals'),
      field: z.string(),
      value: z.union([z.string(), z.number(), z.boolean()]),
    }),
    z.object({
      type: z.literal('before'),
      field: z.string(),
      compareToField: z.string(),
    }),
    z.object({
      type: z.literal('after'),
      field: z.string(),
      compareToField: z.string(),
    }),
    z.object({
      type: z.literal('exists'),
      field: z.string(),
    }),
    z.object({
      type: z.literal('and'),
      conditions: z.array(ruleConditionSchema),
    }),
    z.object({
      type: z.literal('or'),
      conditions: z.array(ruleConditionSchema),
    }),
  ])
);
