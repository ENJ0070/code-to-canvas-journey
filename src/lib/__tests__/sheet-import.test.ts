import { describe, expect, it } from "vitest";
import { pricesFromUsd } from "../import-prices";
import { rowsToProducts } from "../csvImport";
import { selectedUsd, selectionToProduct } from "../sheet-import";
describe("USD sheet import rules", () => {
  it("uses USD rather than CNY and EUR", () => {
    const [row] = rowsToProducts([["title","price_usd","price_cny","price_eur"],["Buty","$25","180","23"]]);
    expect(row?.price).toBe(100);
    expect(row?.price_cny).toBe(181.02);
    expect(pricesFromUsd(25).price).toBe(100);
  });
  it("selects only the dollar token from a multi-currency cell", () => {
    expect(selectedUsd("Cena", "¥180 / $25 / €23", "$25")).toBe(25);
    expect(selectedUsd("Cena", "¥180 / $25 / €23", "€23")).toBeNull();
    expect(selectedUsd("Cena", "¥180 / $25 / €23", "$99")).toBeNull();
  });
  it("keeps only selected product image and converts raw 1688", () => {
    const result = selectionToProduct(["title","USD","photos","link"], ["Buty","25","https://example.com/banner.jpg https://example.com/shoe.jpg","https://detail.1688.com/offer/1077113811328.html"], {row:0,title:"Buty",category:"Buty",usdCell:1,usdText:"25",image:"https://example.com/shoe.jpg",linkCell:3,warning:""});
    expect(result.product?.image_url).toBe("https://example.com/shoe.jpg");
    expect(result.product?.images).toEqual([]);
    expect(result.product?.agent_links.ESGobuy).toBe("https://www.esgobuy.com/productdetail?type=3&id=1077113811328&affcode=XNZ02HX8BH");
  });
  it("never accepts an invented picture or missing USD", () => {
    expect(selectionToProduct(["EUR"],["23"],{row:0,title:"Buty",category:"Buty",usdCell:0,usdText:"23",image:"https://example.com/invented.jpg",linkCell:null,warning:""}).product).toBeNull();
  });
});