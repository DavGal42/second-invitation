"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { invitationContent } from "./invitation-content";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EMPTY_COUNTDOWN: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getCountdown(targetDate: string): Countdown {
  const remaining = Math.max(new Date(targetDate).getTime() - Date.now(), 0);

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };
}

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>(EMPTY_COUNTDOWN);
  const [openMap, setOpenMap] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicUnavailable, setMusicUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const updateCountdown = () =>
      setCountdown(getCountdown(invitationContent.eventDateTime));

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    audioRef.current?.play().catch(() => {
      // Some browsers block audible autoplay until the music button is pressed.
    });
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsMusicPlaying(true);
      setMusicUnavailable(false);
    } catch {
      setMusicUnavailable(true);
    }
  };

  return (
    <main className="invitation-shell">
      <audio
        ref={audioRef}
        src={invitationContent.music.file}
        loop
        autoPlay
        preload="auto"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onError={() => setMusicUnavailable(true)}
      />

      <button
        className={`music-control ${isMusicPlaying ? "is-playing" : ""}`}
        type="button"
        onClick={toggleMusic}
        aria-label={isMusicPlaying ? "Դադարեցնել երաժշտությունը" : "Միացնել երաժշտությունը"}
        title={musicUnavailable ? "Երաժշտության ֆայլը հասանելի չէ" : invitationContent.music.title}
      >
        <span aria-hidden="true">♪</span>
      </button>

      <section className="hero" aria-labelledby="couple-names">
        <div className="hero-copy section-pad">
          <p className="eyebrow">{invitationContent.eyebrow}</p>
          <h1 id="couple-names" className="couple-names">
            {invitationContent.couple.first}
            <span>{invitationContent.couple.connector}</span>
            {invitationContent.couple.second}
          </h1>
        </div>
        <Image
          className="hero-image-slot"
          src="/images/couple.jpg"
          alt="Աշոտ և Մարիամ"
          width={1152}
          height={2048}
          priority
          unoptimized
        />
      </section>

      <section className="welcome section-pad">
        <h2 className="welcome-title" data-reveal>{invitationContent.greeting}</h2>
        <p className="welcome-copy reveal-delay-1" data-reveal>{invitationContent.introduction}</p>
        <p className="event-date reveal-delay-2" data-reveal>{invitationContent.displayDate}</p>
        <p className="countdown-label reveal-delay-3" data-reveal>{invitationContent.countdownLabel}</p>

        <div className="countdown reveal-delay-4" aria-label="Միջոցառմանը մնացած ժամանակը" data-reveal>
          {([
            [countdown.days, "օր"],
            [countdown.hours, "ժամ"],
            [countdown.minutes, "րոպե"],
            [countdown.seconds, "վրկ"],
          ] as const).map(([value, label]) => (
            <div className="countdown-cell" key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {invitationContent.venues.map((venue) => {
        const isOpen = openMap === venue.id;

        return (
          <section className="venue" key={venue.id} aria-labelledby={`${venue.id}-title`}>
            <h2 className="venue-title" id={`${venue.id}-title`} data-reveal>
              {venue.heading}
            </h2>
            <Image
              className="venue-image-slot reveal-delay-1"
              src={venue.image}
              alt={venue.name}
              width={375}
              height={251}
              unoptimized
              data-reveal
            />
            <div className="venue-copy section-pad reveal-delay-2" data-reveal>
              <p className="venue-name">{venue.name}</p>
              <time className="venue-time">{venue.time}</time>
              <button
                className="directions-button"
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${venue.id}-map`}
                onClick={() => setOpenMap(isOpen ? null : venue.id)}
              >
                <span>{isOpen ? "Փակել քարտեզը" : invitationContent.directionsLabel}</span>
                <span className="button-arrow" aria-hidden="true" />
              </button>
            </div>

            <div
              className={`map-reveal ${isOpen ? "is-open" : ""}`}
              id={`${venue.id}-map`}
              aria-hidden={!isOpen}
            >
              <div className="map-reveal-inner">
                <iframe
                  title={`${venue.name} քարտեզ`}
                  src={venue.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  className="map-link"
                  href={venue.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={isOpen ? 0 : -1}
                >
                  Բացել Google Maps-ում
                </a>
              </div>
            </div>
          </section>
        );
      })}

      <footer className="closing section-pad">
        <p data-reveal>{invitationContent.closing}</p>
        <span className="closing-mark reveal-delay-1" aria-hidden="true" data-reveal>A · M</span>
      </footer>
    </main>
  );
}
