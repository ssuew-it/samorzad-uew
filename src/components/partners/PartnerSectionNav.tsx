"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import styles from "./PartnerSectionNav.module.css";

const sections = ["marki", "korzysci", "wspolpraca", "kontakt-partnerzy"] as const;
const messages = {
  pl: { label: "Na stronie Partnerzy", title: "Partnerzy", links: ["Marki", "Korzyści", "Współpraca", "Kontakt"] },
  en: { label: "On the Partners page", title: "Partners", links: ["Brands", "Benefits", "Options", "Contact"] },
};

export function PartnerSectionNav() {
  const c = messages[useLocale() === "en" ? "en" : "pl"];
  const [active, setActive] = useState<string>(sections[0]);

  useEffect(() => {
    const targets = sections.map(id => document.getElementById(id));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string = sections[0];
      for (const target of targets) {
        // Account for fractional pixels after native anchor scrolling.
        if (target && target.getBoundingClientRect().top <= 164) current = target.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <nav className={styles.nav} aria-label={c.label}>
      <div className={styles.inner}>
        <span className={styles.title}>{c.title}<span aria-hidden="true">↗</span></span>
        <ul>{sections.map((id, index) => <li key={id}>
          <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>{c.links[index]}
          </a>
        </li>)}</ul>
      </div>
    </nav>
  );
}
