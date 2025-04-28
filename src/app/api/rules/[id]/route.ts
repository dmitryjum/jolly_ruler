import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ruleConditionSchema } from '@/schemas/ruleCondition';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

const updateRuleSchema = z.object({
  eventName: z.string().min(1).optional(),
  ruleSchema: ruleConditionSchema.optional(),
  reward: z.number().int().optional(),
});

type Params = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = params;

  try {
    const body = await request.json();
    const validationResult = updateRuleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedRule = await prisma.rule.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedRule, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update rule', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.rule.delete({ where: { id } });
    return NextResponse.json({ message: 'Rule deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete rule', details: error.message },
      { status: 500 }
    );
  }
}
