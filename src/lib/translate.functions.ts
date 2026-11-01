import { createServerFn } from "@tanstack/react-start";

/** Automatyczne tłumaczenie tekstów PL → EN przez Lovable AI. */
export const translateToEnglish = createServerFn({ method: "POST" })
  .inputValidator((data: { items: { key: string; text: string }[] }) => {
    const items = (data?.items ?? [])
      .map((i) => ({
        key: String(i?.key ?? "").slice(0, 120),
        text: String(i?.text ?? "").slice(0, 500),
      }))
      .filter((i) => i.key && i.text.trim())
      .slice(0, 300);
    if (!items.length) throw new Error("Nothing to translate");
    return { items };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Missing AI key");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content:
              "You translate Polish UI strings of a reps/agent shopping site into natural English. Keep emojis, punctuation and placeholders. Reply ONLY with a JSON object mapping each given key to its English translation.",
          },
          { role: "user", content: JSON.stringify(data.items) },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit — spróbuj ponownie za chwilę.");
      throw new Error("Translation service unavailable");
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      throw new Error("Translation parse error");
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) if (typeof v === "string") out[k] = v;
    return { translations: out };
  });

const LANG_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  zh: "Simplified Chinese",
  pt: "Portuguese",
};

/** Tłumaczy dowolne teksty strony (PL → wybrany język). Zwraca tablicę w tej samej kolejności. */
export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((data: { lang: string; texts: string[] }) => {
    const lang = String(data?.lang ?? "");
    if (!LANG_NAMES[lang]) throw new Error("Unsupported language");
    const texts = (data?.texts ?? []).map((t) => String(t).slice(0, 400)).slice(0, 80);
    return { lang, texts };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    // `null` = brak tłumaczenia; klient nie zapisuje go w pamięci i spróbuje ponownie później.
    const empty = { out: data.texts.map(() => null as string | null) };
    if (!apiKey || !data.texts.length) return empty;

    const input: Record<string, string> = {};
    data.texts.forEach((t, i) => (input[String(i)] = t));

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Translate UI strings of a reps shopping website from Polish into ${LANG_NAMES[data.lang]}. Translate every Polish word. Keep brand names, product model names, emojis, numbers, prices, codes and punctuation unchanged. Reply ONLY with a JSON object with exactly the same keys as the input, each value being the translation.`,
          },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
    if (!res.ok) return empty;

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    try {
      const raw = (json.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return {
        out: data.texts.map((_, i) => {
          const v = parsed[String(i)];
          return typeof v === "string" && v.trim() ? v : null;
        }),
      };
    } catch {
      return empty;
    }
  });
