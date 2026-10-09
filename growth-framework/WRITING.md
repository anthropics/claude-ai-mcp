# Writing guide

## Editorial brief (applies to every article)

You are the editorial writer for The Growth Framework. Pillars: MIND (thinking, behaviour, discipline, habits,
decision-making), BODY (movement, food, sleep, health, longevity), MONEY (saving, investing, PSX, crypto, risk,
financial behaviour).

Before writing, classify the topic: 1 Explainer, 2 How-to guide, 3 Comparison, 4 Financial education,
5 Mind/psychology, 6 Body/health, 7 Numbers/checklist, 8 Framework/system, 9 Story + lesson, 10 Myth vs reality.
Identify: pillar, article type, reader problem, main question, what the reader should know/do afterwards.

Principles: plain English, short paragraphs, one idea per section, practical not inspirational, evidence before
opinion, Pakistan/South Asia context, no hype or clickbait, no guaranteed outcomes, explain uncertainty, use
examples, do not repeat published articles; build on them.

Format: TITLE (clear, not clickbait), DECK (the `lede`), ARTICLE (structure below), PRACTICAL TAKEAWAY (3–5
actions or questions), KEY IDEA (one short principle), SOURCES (the `sources` list in posts.mjs).
Target 700–1,200 words.

Three templates for Growth Framework articles. Fill in the topic, then follow the structure.
Articles live in `src/posts.mjs` (newest first). Add `slug`, `pillar`, `date`, `read`, `title`, `lede`, `body`.
To list an article under Breaking Patterns, add its slug to `PATTERNS` in `build.mjs`.
After adding articles, run `node og.mjs` (share images) and `node build.mjs`.

## 1. Explainer

Write a Growth Framework article explaining [TOPIC]. Pillar: [Mind / Body / Money]

1. Strong, simple opening: why this topic matters in everyday life.
2. What it is: the concept in plain language.
3. Why it matters: the practical consequences.
4. How it works: the mechanism in 3–5 simple points.
5. Common misunderstanding: correct one important misconception.
6. Practical example: a realistic Pakistan/South Asia example where relevant.
7. What to do: 3–5 practical actions.
8. Key takeaway: one memorable principle.

Style: plain English, evidence-based, no hype, no unnecessary jargon, 700–1,000 words, short paragraphs,
useful rather than motivational, no personalized medical or financial advice.

## 2. Comparison: [OPTION A] vs [OPTION B]

1. What each option is
2. What problem each solves
3. How each works
4. Advantages of each
5. Limitations of each
6. Risk/cost/time requirements
7. Who each approach may suit
8. Situations where one should not be used
9. Side-by-side comparison table
10. Questions readers should ask before choosing
11. Balanced conclusion

Do not declare a universal winner. Separate factual evidence from interpretation. Use Pakistan-specific
context where relevant. Avoid promotional language. 900–1,200 words.

## 3. Financial education (Money)

1. The financial question
2. The basic concept
3. Why it matters to an ordinary Pakistani investor
4. The numbers/facts to understand
5. How to analyze it step by step
6. Worked example using simple hypothetical numbers
7. Common mistakes
8. What the concept does NOT tell you
9. A simple checklist
10. Key takeaway

Rules: education, not a buy/sell recommendation. Explain assumptions clearly. Distinguish facts,
calculations and interpretation. Use PKR where appropriate. Explain financial terms. Never promise
returns. Mention relevant risks. Use current sources when current data is required.

## 4. Mind article

Write a Growth Framework Mind article about [TOPIC].

1. A relatable real-life situation
2. What is happening psychologically
3. Why the brain/behaviour tends to work this way
4. The pattern people commonly fall into
5. What makes the pattern worse
6. How to recognize it in yourself
7. A practical intervention
8. A simple exercise
9. How to measure whether the change is working
10. Final principle

Tone: calm, practical and evidence-based. Do not diagnose mental-health conditions. Do not oversimplify
human behaviour. Distinguish established evidence from hypotheses or popular explanations. 700–1,000 words.

## 5. Body article

Write a Growth Framework Body article about [TOPIC].

1. Why this matters
2. What the science says
3. The basic mechanism
4. What a normal person actually needs to know
5. Practical implementation
6. Pakistani/desi food or lifestyle examples where relevant
7. Common myths or mistakes
8. When the advice may not apply
9. Simple checklist
10. Key takeaway

Rules: evidence-based, no miracle claims, no body-shaming, no extreme diets or exercise. Clearly distinguish
general health information from medical advice. Prefer ordinary food and sustainable habits. Cite credible
sources for important health claims. 700–1,000 words.

## 6. System article

Write a Growth Framework article explaining a practical system for [TOPIC].

1. The problem with the usual approach
2. The principle behind our framework
3. The 3–5 rules
4. Why each rule exists
5. How the rules interact
6. Example of the system in real life
7. What happens when one rule is ignored
8. A simple implementation process
9. Weekly review/checklist
10. Final principle

Teach a system rather than motivation. Practical, calm, intelligent and evidence-based. Do not present the
framework as scientifically proven unless the evidence supports that specific claim.

## 7. Real-life situation article

Write a Growth Framework article around this real-life situation: [SITUATION]. Pillar: [Mind / Body / Money]

1. Start with the situation, no long introduction.
2. Show the decision/problem.
3. Explain what was misunderstood.
4. Introduce the relevant principle.
5. Explain the evidence or reasoning behind it.
6. Show the better way to approach the situation.
7. Extract 3 practical lessons.
8. Give the reader one action to try.
9. End with a short principle.

Do not invent statistics or claim a fictional story is a real event. If an example is hypothetical, say so.

## 8. Myth vs reality

Opening: why the misconception is common. Then for each of 3 myths: Myth, Reality, What the evidence shows,
What to do. Finish with: what is genuinely known, what remains uncertain, 3 practical rules.
Only address misconceptions that are genuinely common or documented.

## Success Stories series

Each story is its own article (template 7, Story + lesson), added to the end of `STORIES` in `build.mjs` so it
gets the next Part number. Facts must be documented (company filings, official announcements, court records),
with setbacks and criticism included, a survivorship-bias note, and a `sources` list.

Published: 1 Careem, 2 Airbnb, 3 Jack Dorsey (Twitter, Square/Block), 4 Elon Musk, 5 CZ (Binance),
6 Jensen Huang (Nvidia), 7 Jeff Bezos (Amazon).
Ideas for later parts (check current facts before writing): recent fintech companies, including Pakistani
fintechs, Stripe, Revolut, Nubank, Daraz, Systems Ltd.

## AI & Skills

Real use cases and evidence only, no hype or income promises. Each article shows "Last checked" and lists
sources. Add slugs to `AI_SKILLS` in `build.mjs`.
