import { describe, expect, it, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ verify: vi.fn(), generate: vi.fn(), block: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock("../session.server", () => ({ verifyToken: mocks.verify }));
vi.mock("@lovable.dev/ai-gateway", () => ({ generateResponse: mocks.generate, GatewayError: class extends Error {} }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.block }) }) }) } }));
import { analyzeSheetBatch } from "../sheet-ai.functions";
const call = analyzeSheetBatch as unknown as (args: { data: { token: string; headers: string[]; rows: string[][] } }) => Promise<{ product: { price: number } | null }[]>;
const input = { token: "private-session", headers: ["title", "USD", "image", "link"], rows: [["Buty", "$25", "https://example.com/shoe.jpg", "https://detail.1688.com/offer/1077113811328.html"]] };
beforeEach(() => { vi.resetAllMocks(); mocks.block.mockResolvedValue({ data: null }); });
describe("signed admin AI import", () => {
  it("rejects signed-out users before any AI call", async () => {
    mocks.verify.mockResolvedValue(null);
    await expect(call({ data: input })).rejects.toThrow("administrator");
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("rejects seller sessions", async () => {
    mocks.verify.mockResolvedValue({ role: "seller" });
    await expect(call({ data: input })).rejects.toThrow("administrator");
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("validates original USD and never sends the session to AI", async () => {
    mocks.verify.mockResolvedValue({ role: "admin" });
    mocks.generate.mockResolvedValue({ output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ rows: [{ row: 0, title: "Buty", category: "Buty", usdCell: 1, usdText: "$25", image: "https://example.com/shoe.jpg", linkCell: 3, warning: "" }] }) }] }] });
    expect((await call({ data: input }))[0]?.product?.price).toBe(100);
    expect(JSON.stringify(mocks.generate.mock.calls)).not.toContain("private-session");
  });
  it("does not retry terminal access blocks", async () => {
    mocks.verify.mockResolvedValue({ role: "admin" }); mocks.block.mockResolvedValue({ data: { message: "Dostęp zablokowany" } });
    await expect(call({ data: input })).rejects.toThrow("zablokowany");
    expect(mocks.generate).not.toHaveBeenCalled();
  });
});