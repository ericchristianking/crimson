import { CrimsonColors } from '@/constants/theme';
import type { ImageSourcePropType } from 'react-native';

export type Block =
  | { type: 'para'; text: string }
  | { type: 'list'; items: string[] };

export type ArticleSection = {
  title?: string;
  titleType?: 'default' | 'do' | 'dont';
  blocks: Block[];
};

export type Article = {
  slug: string;
  title: string;
  tldr: string;
  color: string;
  image: ImageSourcePropType;
  sections: ArticleSection[];
};

export const ARTICLES: Article[] = [
  {
    slug: 'pms',
    title: 'WTF Is PMS, Actually?',
    tldr: "PMS is a hormonal shift that happens about a week before her period. It's real, it's not her being dramatic, and it's definitely not the time to ask \"why are you being so moody?\"",
    color: CrimsonColors.pms,
    image: require('@/assets/images/bg-pms.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "PMS stands for Premenstrual Syndrome. It kicks in roughly 7–10 days before her period starts and usually stops once the period actually arrives. Think of it as the opening act nobody asked for.\n\nIt's caused by a drop in hormones — the same ones that were keeping everything balanced suddenly take a nosedive. Her brain and body are adjusting to that shift. That's it. That's the whole thing.",
          },
        ],
      },
      {
        title: 'What It Actually Looks Like',
        blocks: [
          {
            type: 'list',
            items: [
              "Tired for no reason. Like, slept 9 hours and still exhausted.",
              "Short fuse. Things that wouldn't normally bother her suddenly do. A lot.",
              "Cravings. Usually carbs, sugar, or salt. This isn't a lack of willpower — her body is literally asking for it.",
              "Low mood. Not always angry. Sometimes just flat, anxious, or weirdly emotional.",
              "Wanting space. Or the opposite — wanting extra attention. There's no consistent playbook here.",
            ],
          },
          {
            type: 'para',
            text: "Not every woman gets all of these. Some barely notice PMS. Others get hit hard every single month. It's a spectrum.",
          },
        ],
      },
      {
        title: 'What It Means For You',
        blocks: [
          {
            type: 'para',
            text: "This is the window where your normal behavior might land differently. A joke that's funny on a Tuesday might start a fight on a Thursday. That's not a trap — her tolerance is genuinely lower because her body is dealing with something.",
          },
        ],
      },
      {
        title: 'Do',
        titleType: 'do',
        blocks: [
          {
            type: 'list',
            items: [
              "Take things slightly less personally for a few days",
              "Keep snacks stocked — seriously, this is a cheat code",
              "Give space if she wants it, be present if she doesn't",
              "Just be a little more chill than usual",
            ],
          },
        ],
      },
      {
        title: "Don't",
        titleType: 'dont',
        blocks: [
          {
            type: 'list',
            items: [
              "Ask \"is it PMS?\" — even if it obviously is",
              "Try to fix her mood",
              "Take a moody evening as a sign something is wrong with the relationship",
              "Be weird about it — she knows what's happening, she doesn't need a narrator",
            ],
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "The app flags PMS days on the calendar so you're not blindsided. If you see the PMS phase coming up, you've got a few days' heads up. Use it. It's the whole point.",
          },
        ],
      },
    ],
  },
  {
    slug: 'libido',
    title: "Why She's Horny on Tuesday and Wants to Kill You on Friday",
    tldr: "Her sex drive follows her cycle. It peaks around ovulation, then drops off a cliff heading into PMS. It's hormones, not you.",
    color: '#E85A5F',
    image: require('@/assets/images/bg-regular.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "Estrogen is the hormone that drives desire. It climbs steadily through the first half of her cycle, peaks right around ovulation (roughly mid-cycle), and then falls. Progesterone takes over after that — and progesterone's whole vibe is \"don't touch me, I'm tired.\"\n\nSo if she was all over you on Wednesday and wants nothing to do with you by the weekend, that's not mixed signals. That's chemistry on a schedule.",
          },
        ],
      },
      {
        title: 'What The Phases Feel Like (For You)',
        blocks: [
          {
            type: 'list',
            items: [
              "After her period ends → ovulation: Energy is up, mood is up, sex drive is climbing. This is the stretch where date nights actually land well and she might initiate more.",
              "Ovulation (mid-cycle): Peak. Her body is wired to want it most right now. Don't overthink it, just be available.",
              "After ovulation → PMS: The downhill. She's more tired, less interested, possibly irritable. Physical touch might feel good or might feel like too much. Read the room.",
              "PMS → period: Lowest point for most. Comfort over romance. Blanket-on-the-couch territory.",
            ],
          },
        ],
      },
      {
        title: 'What It Means For You',
        blocks: [
          {
            type: 'para',
            text: "Stop taking fluctuating desire personally. If things were great last week and she's distant this week, check where she is in her cycle before you spiral. Chances are it has nothing to do with the relationship and everything to do with which hormone is running the show.",
          },
        ],
      },
      {
        title: 'Do',
        titleType: 'do',
        blocks: [
          {
            type: 'list',
            items: [
              "Match her energy instead of pushing yours",
              "Initiate more during the first half of her cycle — she'll probably be into it",
              "Back off gracefully during the second half",
            ],
          },
        ],
      },
      {
        title: "Don't",
        titleType: 'dont',
        blocks: [
          {
            type: 'list',
            items: [
              "Sulk when she's not in the mood",
              "Compare this week to last week out loud",
              "Make it about you",
            ],
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "The home screen shows you which phase she's in. You don't need to memorize any of this — just glance at the app and calibrate.",
          },
        ],
      },
    ],
  },
  {
    slug: 'birth-control',
    title: 'Can Cycle Tracking Work as Birth Control?',
    tldr: "Technically yes. Practically, it's risky. And this app is definitely not designed for that.",
    color: CrimsonColors.fertile,
    image: require('@/assets/images/bg-fertile.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "There's a method called FAM — Fertility Awareness Method. The idea is simple: if you know when she's fertile, you can avoid sex (or use protection) during that window. Outside the window, the odds of pregnancy are very low.\n\nOn paper, it makes sense. In practice, it's a lot harder than it sounds.",
          },
        ],
      },
      {
        title: "Why It's Tricky",
        blocks: [
          {
            type: 'list',
            items: [
              "The fertile window is an estimate. Sperm can survive up to 5 days inside her body. The egg lives about 24 hours. So the actual danger zone is roughly 6 days per cycle — but pinpointing exactly which 6 days requires near-perfect tracking.",
              "Cycles shift. Stress, travel, sleep, illness — all of these can move ovulation by days. The window you planned around might not be where you thought it was.",
              "Perfect use vs. real life. With perfect tracking, FAM can be 95–99% effective. With typical use — meaning real humans being imperfect — it drops to around 76–88%. For what it's worth, contraceptives aren't 100% either. But that gap can be a baby.",
            ],
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "Crimson estimates the fertile window based on logged period data. It's good for awareness — knowing roughly where she is in the cycle. But it's using predictions, not real-time biological signals like basal body temperature.\n\nCrimson is a tracking tool, not a contraceptive. Don't use it as one — unless you're willing to take the risk of someone getting pregnant.",
          },
        ],
      },
    ],
  },
  {
    slug: 'ovulation',
    title: 'Ovulation: The Main Event You Know Nothing About',
    tldr: "Ovulation is the one day per cycle when she can actually get pregnant. Everything else — the mood shifts, PMS, the period itself — revolves around this one event.",
    color: CrimsonColors.ovulation,
    image: require('@/assets/images/bg-ovulation.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "Once per cycle, one of her ovaries releases an egg. That's ovulation. The egg survives about 24 hours. If it meets sperm during that window, pregnancy is possible. If it doesn't, the body scraps the whole setup and starts over. That restart is her period.\n\nEverything else — PMS, the fertile window, the mood shifts, the libido changes — is either the body preparing for this moment or dealing with the aftermath.",
          },
        ],
      },
      {
        title: 'Why It Matters More Than You Think',
        blocks: [
          {
            type: 'para',
            text: "You probably think of her period as the main event. It's not. The period is the cleanup crew. Ovulation is the main event.",
          },
          {
            type: 'list',
            items: [
              "Before ovulation: Her body is building up. Estrogen rises, energy increases, mood lifts, sex drive climbs. She tends to look and feel her best around this time.",
              "Ovulation day: Peak fertility, peak confidence for most women. This is the day everything was building toward.",
              "After ovulation: Progesterone takes over. Energy dips, mood can shift, and if pregnancy didn't happen, PMS symptoms start rolling in about a week later.",
            ],
          },
        ],
      },
      {
        title: 'The Fertile Window Is Bigger Than One Day',
        blocks: [
          {
            type: 'para',
            text: "The egg only lives 24 hours, but sperm can survive up to 5 days. So the realistic fertile window is about 6 days: the 5 days before ovulation plus ovulation day itself. That's why Crimson shows a multi-day fertile window, not just one day.",
          },
        ],
      },
      {
        title: 'What It Means For You',
        blocks: [
          {
            type: 'para',
            text: "Understanding ovulation is the cheat code to understanding the whole cycle. Once you get that everything builds toward this one day and then unwinds after it, the mood swings, energy shifts, and desire fluctuations all make sense. It's not random. There's a rhythm.",
          },
        ],
      },
      {
        title: 'Do',
        titleType: 'do',
        blocks: [
          {
            type: 'list',
            items: [
              "Pay attention to the fertile window in the app — it's the most important data point",
              "Plan accordingly — dates, intimacy, or contraception depending on what you're going for",
            ],
          },
        ],
      },
      {
        title: "Don't",
        titleType: 'dont',
        blocks: [
          {
            type: 'list',
            items: [
              "Assume you can pinpoint the exact day without medical-grade tracking",
              "Forget that the predictions are estimates based on past cycles",
            ],
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "The app marks the estimated ovulation day and the surrounding fertile window. It's calculated from her logged period data. The more consistently periods are logged, the more accurate the estimate gets.",
          },
        ],
      },
    ],
  },
  {
    slug: 'irregular',
    title: 'Dealing With Irregular Cycles',
    tldr: "Not every cycle is predictable. If hers jumps around, the app's predictions are rougher — but consistent logging makes them better over time.",
    color: CrimsonColors.primary,
    image: require('@/assets/images/bg-calendar.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "You've probably heard \"a cycle is 28 days.\" That's an average, not a rule. Normal cycles range anywhere from 21 to 35 days, and plenty of women fall outside even that. Some months it's 26 days, next month it's 33. That's irregular, and it's more common than people think.",
          },
        ],
      },
      {
        title: 'Why Cycles Go Off-Script',
        blocks: [
          {
            type: 'list',
            items: [
              "Stress. Big one. Work pressure, bad sleep, emotional stress — all of it can delay ovulation, which pushes the whole cycle back.",
              "Life changes. New job, moving, travel across time zones, major diet changes, intense exercise. The body interprets disruption as \"not a great time\" and adjusts.",
              "Coming off birth control. Hormonal contraception suppresses the natural cycle. After stopping, it can take months for things to regulate. Some women bounce back fast, others take a year.",
              "Underlying conditions. Things like PCOS or thyroid issues can cause persistent irregularity. Worth a doctor's visit — but that's her call, not your suggestion to make unprompted.",
            ],
          },
        ],
      },
      {
        title: 'What It Means For Tracking',
        blocks: [
          {
            type: 'para',
            text: "Cycle tracking apps (including Crimson) work best with consistent cycles. The predictions are based on past data. If her last three cycles were 25, 31, and 28 days, the app is doing its best to average that — but the fertile window and PMS estimates are going to be fuzzier than someone with a clockwork 27-day cycle.\n\nThat doesn't mean tracking is pointless. It means:",
          },
          {
            type: 'list',
            items: [
              "Log everything. Every period start date, every period length. More data = better predictions, even with irregular cycles.",
              "Don't trust predictions blindly. If the app says \"fertile window starts Thursday\" but her cycle has been chaotic, treat that as a ballpark, not a guarantee.",
              "Watch for patterns. Sometimes irregularity has its own pattern — like cycles that are always between 28–34 days. That's still useful info.",
            ],
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "The more periods you log, the more data the app has to work with. Even with irregular cycles, trends start to emerge over a few months. Crimson uses whatever history it has to give you the best estimate possible. It's not perfect, but it beats guessing.",
          },
        ],
      },
      {
        title: 'Do',
        titleType: 'do',
        blocks: [
          {
            type: 'list',
            items: [
              "Keep logging, even when cycles are messy",
              "Treat predictions as estimates, not facts",
              "Be patient — accuracy improves with data",
            ],
          },
        ],
      },
      {
        title: "Don't",
        titleType: 'dont',
        blocks: [
          {
            type: 'list',
            items: [
              "Assume the app is broken when predictions are off",
              "Panic about irregularity — some variation is normal",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pmdd',
    title: 'PMDD: When PMS Goes Nuclear',
    tldr: "PMDD is PMS's severe version. Same timing, but the symptoms are intense enough to seriously disrupt daily life. It's a real medical condition, not just \"bad PMS.\"",
    color: '#B03080',
    image: require('@/assets/images/bg-period.jpg'),
    sections: [
      {
        title: 'The Short Version',
        blocks: [
          {
            type: 'para',
            text: "PMDD stands for Premenstrual Dysphoric Disorder. It follows the same schedule as PMS (the week or so before her period) but the intensity is on a completely different level. We're not talking about being a bit moody or wanting chocolate. We're talking about anxiety that makes it hard to function, depression that comes out of nowhere, or anger that feels completely disproportionate — and then it lifts once her period starts, like a switch flipped.\n\nAbout 5–8% of women deal with PMDD. It's underdiagnosed because most people (including a lot of doctors) just write it off as \"bad PMS.\"",
          },
        ],
      },
      {
        title: "How It's Different From PMS",
        blocks: [
          {
            type: 'para',
            text: "Where PMS brings irritability and moodiness, PMDD brings severe anxiety, depression, or rage. Where PMS is annoying but manageable, PMDD can make it impossible to work or function normally. PMS usually shows up a few days before her period — PMDD can stretch up to two weeks before.\n\nThe one thing they share: both go away once her period actually starts. That on/off pattern is the signature. If she's a completely different person for 1–2 weeks per month and then totally fine once her period arrives, that's the clue.",
          },
        ],
      },
      {
        title: 'What It Means For You',
        blocks: [
          {
            type: 'para',
            text: "It's not about you, and it's not about the relationship. PMDD is a neurological sensitivity to normal hormonal changes — her brain reacts differently to the same shifts every woman has. She probably knows something is off, and that awareness doesn't make it easier to control. The best thing you can do is be steady and consistent, learn the pattern so you're not caught off guard, and support without diagnosing. It's treatable — SSRIs, certain birth control methods, and therapy can all help — but that's a conversation she has with a doctor when she's ready.",
          },
        ],
      },
      {
        title: 'How Crimson Helps',
        blocks: [
          {
            type: 'para',
            text: "Track the pattern. If the worst episodes consistently fall in the PMS window on the calendar, that data is genuinely useful — for her, for a doctor, for understanding that it's cyclical and not random. Crimson won't diagnose anything, but it can make the pattern visible.",
          },
        ],
      },
    ],
  },
];
