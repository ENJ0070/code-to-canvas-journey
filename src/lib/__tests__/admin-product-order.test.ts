import { describe, expect, it } from "vitest";
import { sortAdminProducts } from "../admin-product-order";

const complete = { price: 100, image_url: "https://example.com/main.jpg", qc_images: ["https://example.com/qc.jpg"] };

describe("admin product review order", () => {
  it("puts price 0 before every other missing field", () => {
    const rows = [{ ...complete, id: "no-image", image_url: "" }, { ...complete, id: "zero", price: 0 }];
    expect(sortAdminProducts(rows).map(p => p.id)).toEqual(["zero", "no-image"]);
  });
  it("puts missing main photos before missing QC regardless of missing links", () => {
    const rows = [{ ...complete, id: "no-qc", qc_images: [], store_url: "" }, { ...complete, id: "no-image", image_url: " " }];
    expect(sortAdminProducts(rows).map(p => p.id)).toEqual(["no-image", "no-qc"]);
  });
  it("puts missing QC before complete products", () => {
    const rows = [{ ...complete, id: "complete" }, { ...complete, id: "no-qc", qc_images: [" "] }];
    expect(sortAdminProducts(rows).map(p => p.id)).toEqual(["no-qc", "complete"]);
  });
  it("keeps existing order within each priority group without mutating input", () => {
    const rows = [{ ...complete, id: "first", price: 0 }, { ...complete, id: "second", price: 0 }];
    expect(sortAdminProducts(rows).map(p => p.id)).toEqual(["first", "second"]);
    expect(rows.map(p => p.id)).toEqual(["first", "second"]);
  });
});