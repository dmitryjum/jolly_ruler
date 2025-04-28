import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { ruleConditionSchema } from "@/schemas/ruleCondition";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const ruleSchema = z.object({
  eventName: z.string().min(1),
  ruleSchema: ruleConditionSchema,
  reward: z.number().int().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = ruleSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventName, ruleSchema: validatedRuleSchema, reward } = validationResult.data;

    const rule = await prisma.rule.create({
      data: {
        eventName,
        ruleSchema: validatedRuleSchema, // Stored as JSON
        reward,
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
}

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