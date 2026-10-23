"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { FolderCard, type FolderTone } from "./cards/FolderCard";

type Item = { number: string; title: string; text: string; href: string; tone: FolderTone; caption?: { title: string; text: string } };

/*
 * Card deck: the folder cards start stacked with a slight offset at the centre of the group,
 * then fan out into place when the deck scrolls into view (motion only, per the design note).
 */
export function FolderDeck({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const stacked = useRef(false);

  // stack the cards on top of each other before they are seen (before first paint)
  useLayoutEffect(() => {
    const deck = ref.current;
    if (!deck || reduce) return;
    const cards = Array.from(deck.querySelectorAll<HTMLElement>(".deck-item"));
    const box = deck.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const mid = (cards.length - 1) / 2;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      card.style.transform = `translate(${dx + (i - mid) * 14}px, ${dy + Math.abs(i - mid) * 10}px) rotate(${(i - mid) * 4}deg)`;
      card.style.zIndex = String(cards.length - Math.round(Math.abs(i - mid)));
    });
    stacked.current = true;
  }, [reduce]);

  // fan out into place
  useEffect(() => {
    const deck = ref.current;
    if (!deck || !inView || !stacked.current) return;
    const cards = Array.from(deck.querySelectorAll<HTMLElement>(".deck-item"));
    cards.forEach((card, i) => {
      animate(card, { transform: "translate(0px, 0px) rotate(0deg)" }, { type: "spring", stiffness: 140, damping: 18, delay: 0.1 + i * 0.07 }).then(() => {
        card.style.transform = "";
        card.style.zIndex = "";
      });
    });
  }, [inView]);

  return (
    <div className="deck" ref={ref}>
      {items.map((item) => (
        <div className="deck-item" key={item.number}>
          <FolderCard number={item.number} title={item.title} text={item.text} href={item.href} tone={item.tone} />
          {item.caption ? (
            <div className="deck-cap">
              <b>{item.caption.title}</b>
              <span>{item.caption.text}</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
