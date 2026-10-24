import { describe, it, expect } from "vitest";
import { convertLink } from "../linkConverter";

describe("LoveGoBuy link conversion", () => {
  it("converts 1688 links", () => {
    expect(convertLink("https://detail.1688.com/offer/978136831309.html", "LoveGoBuy")).toBe(
      "https://www.esgobuy.com/productdetail?type=3&id=978136831309&affcode=XNZ02HX8BH",
    );
  });
  it("converts weidian links", () => {
    expect(convertLink("https://weidian.com/item.html?itemID=7866805981", "LoveGoBuy")).toBe(
      "https://www.esgobuy.com/productdetail?type=5&id=7866805981&affcode=XNZ02HX8BH",
    );
  });
  it("converts old Litbuy links to LoveGoBuy", () => {
    expect(
      convertLink("https://litbuy.com/product/weidian/7702256586?linkSearch=true&inviteCode=PKMR", "LoveGoBuy"),
    ).toBe("https://www.esgobuy.com/productdetail?type=5&id=7702256586&affcode=XNZ02HX8BH");
  });
});

import { productAgentLink } from "../linkConverter";
describe("product agent link matching", () => {
  const p = {
    agent_links: {
      LoveGoBuy: "https://www.esgobuy.com/productdetail?type=3&id=996985791005&affcode=XNZ02HX8BH",
      Kakaobuy: "https://item.kakobuy.com/item/details?url=x&affcode=six7n",
      USFans: "https://www.usfans.com/product/1/996985791005?ref=5FTXZW",
    },
  };
  it("matches agent names regardless of spelling", () => {
    expect(productAgentLink(p, "Lovegobuy")).toBe(p.agent_links.LoveGoBuy);
    expect(productAgentLink(p, "KakoBuy")).toBe(p.agent_links.Kakaobuy);
    expect(productAgentLink(p, "UsFans")).toBe(p.agent_links.USFans);
  });
  it("builds LoveGoBuy product link from another agent link when missing", () => {
    expect(
      productAgentLink({ agent_links: { USFans: "https://www.usfans.com/product/3/7702256586?ref=5FTXZW" } }, "Lovegobuy"),
    ).toBe("https://www.esgobuy.com/productdetail?type=5&id=7702256586&affcode=XNZ02HX8BH");
  });
});

import { extractSourceLink } from "../linkConverter";
describe("ESGobuy rules", () => {
  it("converts exact 1688 example", () => expect(convertLink("https://detail.1688.com/offer/1077113811328.html", "ESGobuy")).toBe("https://www.esgobuy.com/productdetail?type=3&id=1077113811328&affcode=XNZ02HX8BH"));
  it("converts exact Weidian example", () => expect(convertLink("https://shop1751818001.v.weidian.com/item.html?itemID=7643533507", "ESGobuy")).toBe("https://www.esgobuy.com/productdetail?type=5&id=7643533507&affcode=XNZ02HX8BH"));
  it("maps Taobao to confirmed type 1", () => expect(convertLink("https://item.taobao.com/item.htm?id=123456789", "ESGobuy")).toBe("https://www.esgobuy.com/productdetail?type=1&id=123456789&affcode=XNZ02HX8BH"));
  it("round trips ESGobuy to source", () => expect(extractSourceLink("https://www.esgobuy.com/productdetail?type=5&id=7643533507&affcode=XNZ02HX8BH")?.platform).toBe("weidian"));
});
