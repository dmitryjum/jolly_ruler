import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { ruleConditionSchema } from "@/schemas/ruleCondition";
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict',
});

const ruleSchema = z.object({
  eventName: z.string().min(1),
  ruleSchema: ruleConditionSchema,
  reward: z.number().int().optional(),
});

const userPromptSchema = z.object({
  prompt: z.string().min(10), // minimal length for sanity check
});

// rule payload example:

// {
//   "eventName": "visit",
//   "ruleSchema": {
//     "type": "and",
//     "conditions": [
//       {
//         "type": "equals",
//         "field": "correctClockInMethod",
//         "value": true
//       },
//       {
//         "type": "before",
//         "field": "clockInTime",
//         "compareToField": "scheduledStartTime"
//       }
//     ]
//   },
//   "reward": 5000
// }

function systemPrompt(userPrompt: string) {
  return `
  You are a smart assistant that converts user natural language into strict JSON following a Zod schema.

  The schema describes a Rule which contains:
  - 'eventName': the type of event that occurs (like 'visit' or 'clockIn')
  - 'ruleSchema': a condition object describing how the event should be evaluated, using operators like equals, before, after, and, or
  - 'reward': an optional integer value representing bonus points

  User input:
  ${userPrompt}

  Strictly output the JSON object following the schema. No explanations. No extra text.
    `.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // const validationResult = ruleSchema.safeParse(body)
    const validationResult = userPromptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // const { eventName, ruleSchema: validatedRuleSchema, reward } = validationResult.data;
    const { prompt } = validationResult.data;

    const { object: generatedRule} = await generateObject({
      model: openai.chat('gpt-4o'),
      prompt: systemPrompt(prompt),
      schema: ruleSchema,
    });

    const rule = await prisma.rule.create({
      data: {
        eventName: generatedRule.eventName,
        ruleSchema: generatedRule.ruleSchema,
        reward: generatedRule.reward,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create rule', details: error.message },
      { status: 500 }
    );
  }
};

//TODO: accept query params to filter rules by limit number return or/and pagination
export async function GET() {
  try {
    const rules = await prisma.rule.findMany();
    return NextResponse.json(rules, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch rules', details: error.message },
      { status: 500 }
    );
  }
}