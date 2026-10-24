import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSocials } from "@/components/profile/ProfileSocials";

describe("Profile social icons", () => {
  it("shows Discord, TikTok and website icons when all three addresses are filled", () => {
    render(
      <ProfileSocials
        socials={{ discord: "https://discord.gg/pkm", tiktok: "https://tiktok.com/@pkm", website: "/" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Discord" })).toHaveAttribute("href", "https://discord.gg/pkm");
    expect(screen.getByRole("link", { name: "TikTok" })).toHaveAttribute("href", "https://tiktok.com/@pkm");
    expect(screen.getByRole("link", { name: "Strona" })).toHaveAttribute("href", "/");
  });

  it("opens external profiles in a new tab but keeps the site link in place", () => {
    render(
      <ProfileSocials
        socials={{ discord: "https://discord.gg/pkm", tiktok: "", website: "/" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Discord" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Strona" })).not.toHaveAttribute("target");
    expect(screen.queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
  });

  it("renders nothing when no address is filled", () => {
    const { container } = render(<ProfileSocials socials={{ discord: "", tiktok: "", website: "" }} />);

    expect(container).toBeEmptyDOMElement();
  });
});
