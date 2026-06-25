import { useState } from "react";

const logoModules = import.meta.glob("../assets/teams/48/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const logoByAbbr: Record<string, string> = Object.fromEntries(
  Object.entries(logoModules).map(([path, url]) => {
    const abbr = path.split("/").pop()!.replace(".png", "").toUpperCase();
    return [abbr, url];
  }),
);

export function TeamLogo({
  abbr,
  className = "h-6 w-6 inline-block align-middle",
}: {
  abbr: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = logoByAbbr[abbr];

  if (!src || failed) {
    return <span className="font-bold">{abbr}</span>;
  }

  return (
    <img
      src={src}
      alt={abbr}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
