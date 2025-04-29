import request from "supertest";
import { createOpenAI } from "@ai-sdk/openai";
import { app } from "next/server"; // Mock Next.js server

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(() => ({
    chat: jest.fn(() => ({
      generateObject: jest.fn(async () => ({
        object: {
          eventName: "visit",
          ruleSchema: {
            type: "and",
            conditions: [
              {
                type: "equals",
                field: "correctClockInMethod",
                value: true,
              },
              {
                type: "before",
                field: "clockInTime",
                compareToField: "scheduledStartTime",
              },
            ],
          },
          reward: 5000,
        },
      })),
    })),
  })),
}));

describe("POST /api/rules", () => {
  it("should create a rule from a human text prompt", async () => {
    const response = await request(app)
      .post("/api/rules")
      .send({
        prompt: "Create a rule for clocking in before the scheduled time.",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        eventName: "visit",
        ruleSchema: expect.objectContaining({
          type: "and",
          conditions: expect.any(Array),
        }),
        reward: 5000,
      })
    );
  });

  it("should return 400 for invalid input", async () => {
    const response = await request(app).post("/api/rules").send({
      prompt: "short", // Invalid prompt (too short)
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 500 if OpenAI API fails", async () => {
    jest.spyOn(createOpenAI().chat(), "generateObject").mockRejectedValueOnce(new Error("OpenAI API error"));

    const response = await request(app)
      .post("/api/rules")
      .send({
        prompt: "Create a rule for clocking in before the scheduled time.",
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Failed to create rule");
  });
});