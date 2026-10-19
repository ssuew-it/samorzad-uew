"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ArrowUpRight, Check, Ticket, Lightbulb, UsersThree } from "@phosphor-icons/react";
import styles from "./PartnershipPicker.module.css";

const content = {
  pl: {
    eyebrow: "Od pomysłu do współpracy", title: "Co zrobimy razem?", lead: "Wybierz kierunek. Pokażemy Ci, od czego możemy zacząć.", label: "Forma współpracy", possibilities: "Możliwe działania", next: "Pierwszy krok", cta: "Porozmawiajmy o tym", note: "To punkt wyjścia do rozmowy. Zakres i dostępność ustalimy wspólnie.", draft: "Dzień dobry! Interesuje nas współpraca w obszarze: ",
    options: [
      { name: "Wydarzenia", short: "Bądź częścią studenckich spotkań.", title: "Twoja marka. Wspólne przeżycia.", body: "Zaplanujmy obecność marki tam, gdzie studenci spotykają się, poznają i tworzą wspomnienia.", items: ["Strefa marki podczas wydarzenia", "Aktywacja lub konkurs dla uczestników", "Wsparcie organizacyjne i rzeczowe"], next: "Opowiedz o marce, interesującym Cię wydarzeniu i terminie.", stamp: "SPOTKANIA", word: "Przeżyjmy to." },
      { name: "Wspólne projekty", short: "Dajmy dobremu pomysłowi rozpęd.", title: "Z pomysłu w coś realnego.", body: "Połączmy studencką inicjatywę z doświadczeniem i możliwościami Twojej organizacji.", items: ["Warsztaty i spotkania z ekspertami", "Wsparcie inicjatywy studenckiej", "Projekt tworzony wspólnie od podstaw"], next: "Opisz pomysł, cel i to, co możecie wnieść do projektu.", stamp: "POMYSŁY", word: "Stwórzmy coś." },
      { name: "Kontakt ze studentami", short: "Zacznijmy wartościową rozmowę.", title: "Poznaj ludzi. Otwórz możliwości.", body: "Porozmawiajmy o tym, jak przedstawić studentom Twoją organizację i podzielić się wiedzą.", items: ["Spotkanie z zespołem Twojej organizacji", "Prezentacja ścieżek rozwoju i kariery", "Komunikacja dopasowana do inicjatywy"], next: "Napisz, do kogo chcesz dotrzeć i co chcesz zaproponować.", stamp: "RELACJE", word: "Poznajmy się." },
    ],
  },
  en: {
    eyebrow: "From an idea to a partnership", title: "What shall we create?", lead: "Choose a direction. Discover where we could begin.", label: "Partnership format", possibilities: "Possible activities", next: "First step", cta: "Let’s talk about it", note: "A starting point for a conversation. We’ll agree on scope and availability together.", draft: "Hello! We are interested in a partnership focused on: ",
    options: [
      { name: "Events", short: "Be part of student experiences.", title: "Your brand. Shared experiences.", body: "Let’s plan your brand’s presence where students meet, connect and make memories.", items: ["A brand space at an event", "An activity or competition for participants", "Organisational and in-kind support"], next: "Tell us about your brand, the event and your preferred timing.", stamp: "EXPERIENCES", word: "Make a moment." },
      { name: "Joint projects", short: "Give a great idea momentum.", title: "Turn an idea into something real.", body: "Combine student initiative with your organisation’s experience and resources.", items: ["Workshops and expert sessions", "Support for a student initiative", "A project developed together from scratch"], next: "Describe the idea, its purpose and what you could contribute.", stamp: "IDEAS", word: "Create together." },
      { name: "Student connections", short: "Start a meaningful conversation.", title: "Meet people. Open possibilities.", body: "Let’s explore how to introduce your organisation to students and share your knowledge.", items: ["A session with your organisation’s team", "Career and development opportunities", "Communication tailored to the initiative"], next: "Tell us who you would like to reach and what you can offer.", stamp: "CONNECTIONS", word: "Let’s connect." },
    ],
  },
};
const icons = [Ticket, Lightbulb, UsersThree];

export function PartnershipPicker({ onChoose }: { onChoose: (message: string, topic: string) => void }) {
  const c = content[useLocale() === "en" ? "en" : "pl"];
  const [selected, setSelected] = useState(0);
  const [animate, setAnimate] = useState(false);
  const option = c.options[selected];
  const Icon = icons[selected];
  return (
    <section id="wspolpraca" className={styles.section} aria-labelledby="partnership-heading">
      <div className={styles.inner}>
        <header className={styles.heading}><p>{c.eyebrow}</p><h2 id="partnership-heading">{c.title}</h2><div>{c.lead}</div></header>
        <fieldset className={styles.choices} onPointerDown={() => setAnimate(true)} onKeyDown={() => setAnimate(false)}>
          <legend className="sr-only">{c.label}</legend>
          {c.options.map((item, i) => <label key={item.name} className={styles.choice}>
            <input type="radio" name="partnership-format" value={i} checked={selected === i} onChange={() => setSelected(i)} aria-controls="partnership-detail" />
            <span className={styles.choiceBody}><span className={styles.number}>0{i + 1}</span><span><strong>{item.name}</strong><small>{item.short}</small></span><span className={styles.check}><Check size={16} aria-hidden="true" /></span></span>
          </label>)}
        </fieldset>
        <div id="partnership-detail" className={styles.detail}>
          <div className={styles.art} data-scene={selected} data-animate={animate} aria-hidden="true">
            <span className={styles.stamp}>{option.stamp} / SSUEW</span>
            <div className={styles.artRing} /><div className={styles.artRingSmall} />
            <div key={selected} className={styles.symbol}><Icon size={100} weight="duotone" /></div>
            <span className={styles.plus}>+</span><span className={styles.index}>0{selected + 1}</span>
            <strong>{option.word}</strong>
          </div>
          <div className={styles.description}>
            <div aria-live="polite" aria-atomic="true"><h3>{option.title}</h3><p>{option.body}</p></div>
            <h4>{c.possibilities}</h4>
            <ul>{option.items.map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>
            <div className={styles.next}><h4>{c.next}</h4><p>{option.next}</p></div>
            <a href="#kontakt-partnerzy" className={styles.cta} onClick={() => onChoose(`${c.draft}${option.name}.\n\n`, option.name)}>{c.cta}<ArrowUpRight size={20} aria-hidden="true" /></a>
          </div>
        </div>
        <p className={styles.note}>{c.note}</p>
      </div>
    </section>
  );
}
