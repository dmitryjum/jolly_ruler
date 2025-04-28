import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const ruleSchema = z.object({
  eventName: z.string().min(1),
  method: z.boolean(),
  reward: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, method, reward } = body;

    if (!eventName || typeof method !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const rule = await prisma.rule.create({
      data: { eventName, method, reward },
    });

    return NextResponse.json(rule);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create event' }), { status: 500 });
  }
}