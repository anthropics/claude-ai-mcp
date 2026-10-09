// "Foundations" guides shown at the top of the Mind, Body and Money pages, and summarised on the home page.
// Each section: id (anchor), title, line (one-sentence summary for the home page), html (full section).
// Health and money facts here follow established guidance (WHO, NIH, SECP/SBP) and stay general on purpose.

const table = (head, rows) =>
  `<div class='tablewrap'><table><thead><tr>${head.map(h => `<th scope='col'>${h}</th>`).join('')}</tr></thead><tbody>` +
  rows.map(r => `<tr>${r.map((c, i) => i ? `<td data-label='${head[i]}'>${c}</td>` : `<th scope='row'>${c}</th>`).join('')}</tr>`).join('') +
  `</tbody></table></div>`;

const callout = (title, text) => `<div class='callout'><b>${title}</b> ${text}</div>`;

export const FOUNDATIONS = {
  Mind: {
    intro: 'The Mind pillar is about the person making the decisions: how you hold a routine on a bad day, how you choose where to aim, and how you stay well enough to keep going.',
    sections: [
      {
        id: 'discipline', title: 'Discipline', line: 'Doing the planned thing when you do not feel like it. A skill you build, not a trait you have.',
        html: `<p>Discipline is not about forcing yourself through every day on willpower. It is about deciding in advance, making the right action easy, and making it small enough that you can do it on a bad day.</p>
<ul><li><b>Decide before the moment.</b> Write the action, the day and the time. "When I finish Fajr, I walk for 20 minutes" works better than "walk more".</li>
<li><b>Shrink it.</b> If you skip a habit twice, make it smaller rather than giving up. Ten push-ups done beats fifty planned.</li>
<li><b>Change the setting.</b> Put the shoes by the door, keep the phone out of the bedroom, keep the trading app off the home screen.</li>
<li><b>Track the streak, forgive the gap.</b> Missing one day is normal. Missing two in a row is the signal to adjust.</li></ul>
${callout('How long it takes.', 'In one well-known study, new habits took 66 days on average to feel automatic, with a range of 18 to 254 days. Expect weeks, not days.')}`,
      },
      {
        id: 'ambition', title: 'Ambition', line: 'A clear direction, written down. Ambition without a plan turns into stress.',
        html: `<p>Ambition is the reason the discipline matters. Without a direction, routines feel like chores. Without a plan, ambition turns into worry.</p>
<ol><li><b>One aim per pillar for the year.</b> For example: run 5 km without stopping, read one book a month, build an emergency fund of three months' expenses.</li>
<li><b>One focus for the next 90 days.</b> Pick the single aim that would make the others easier.</li>
<li><b>One action for this week.</b> Small, scheduled and measurable.</li></ol>
<p>Review it every Sunday. Ambition grows when you can see progress, even slow progress.</p>`,
      },
      {
        id: 'wellness', title: 'Wellness', line: 'Sleep, stress, people and purpose: the base everything else stands on.',
        html: `<p>Wellness is what keeps discipline and ambition from burning you out. It is not a luxury; it is maintenance.</p>
<ul><li><b>Sleep.</b> Most adults need seven or more hours. A fixed wake-up time is the easiest place to start.</li>
<li><b>Stress.</b> Some stress helps you grow. Constant stress wears you down. Walking, prayer or quiet breathing, time outdoors and less late-night scrolling all help.</li>
<li><b>People.</b> Regular time with family and friends is part of a healthy life, not a distraction from it.</li>
<li><b>Purpose.</b> Work or projects that matter to you give the routine a reason.</li></ul>
${callout('If you are struggling.', 'Low mood, anxiety or poor sleep that lasts for weeks is a health issue, not a discipline problem. Talk to a doctor or a qualified counsellor.')}`,
      },
    ],
  },

  Body: {
    intro: 'The Body pillar covers how you move, what you eat and what your body actually needs to run well: from protein and fibre to vitamins, minerals and electrolytes. Food first, simple training, and honest notes on supplements.',
    sections: [
      {
        id: 'movement', title: 'Physical activity', line: 'At least 150 minutes of moderate activity a week, plus strength work twice a week.',
        html: `<p>The World Health Organization recommends that adults do:</p>
<ul><li><b>150 to 300 minutes a week</b> of moderate activity, such as brisk walking, or <b>75 to 150 minutes</b> of vigorous activity, such as running;</li>
<li><b>muscle-strengthening work on two or more days</b> a week;</li>
<li>less time sitting. Any movement is better than none.</li></ul>
<p>That is about 20 to 40 minutes a day. A daily walk counts.</p>`,
      },
      {
        id: 'exercises', title: 'Exercises', line: 'Five basic movements, a daily walk and some mobility cover most of what you need.',
        html: `<p>You do not need a gym. A simple weekly plan:</p>
${table(['Type', 'Examples', 'How often'], [
  ['Walking or cardio', 'Brisk walk, cycling, stairs, jogging', 'Most days, 20 to 40 minutes'],
  ['Strength', 'Squat or sit-to-stand, push-up, row with a band or backpack, hip hinge, plank', '2 or 3 days a week, 2 or 3 sets of 8 to 12'],
  ['Mobility', 'Yoga, stretching, hip and shoulder circles', 'A few minutes daily, or after training'],
])}
<p>Start easy and add a little each week. Stop if you feel sharp pain. If you have a heart condition, joint problems or have been inactive for a long time, check with a doctor first.</p>`,
      },
      {
        id: 'food', title: 'Food values', line: 'What protein, carbs, fats, fibre and water each do, and a simple desi plate.',
        html: `<p>Your body needs five things from food and drink every day:</p>
${table(['Nutrient', 'What it does', 'Good sources'], [
  ['Protein', 'Builds and repairs muscle and tissue', 'Daal, chana, eggs, chicken, fish, dahi, milk, paneer'],
  ['Carbohydrates', 'Main fuel for the brain and muscles', 'Whole-wheat roti, brown rice, oats, fruit, vegetables, pulses'],
  ['Fats', 'Energy, hormones, and absorbing vitamins A, D, E and K', 'Nuts, seeds, olive or mustard oil, fish; go easy on ghee and fried food'],
  ['Fibre', 'Digestion, steady blood sugar, feeling full', 'Vegetables, fruit, whole grains, daal, chana'],
  ['Water', 'Temperature, circulation, every cell', 'Water first; more in hot weather and when training'],
])}
<p><b>How much protein?</b> The standard adult reference amount is about 0.8 g per kilogram of body weight a day. People who train regularly often need more. <b>Fibre:</b> the WHO suggests at least 25 g a day for adults.</p>
${callout('The simple desi plate.', 'Half the plate vegetables or salad, a quarter protein (daal, chana, eggs, chicken or fish) and a quarter roti or rice, ideally whole-grain. Add dahi on the side.')}`,
      },
      {
        id: 'vitamins-minerals', title: 'Vitamins and minerals', line: 'The micronutrients your body cannot make in enough amounts, and where to get them.',
        html: `<p>Vitamins and minerals are needed in small amounts, but the body cannot make most of them in the amounts it needs. A varied diet covers most people. These are the ones worth knowing:</p>
${table(['Nutrient', 'Why the body needs it', 'Where to get it'], [
  ['Vitamin D', 'Bones, muscles and immunity', 'Sunlight on the skin, eggs, oily fish, fortified foods'],
  ['Vitamin B12', 'Nerves and red blood cells', 'Meat, fish, eggs, milk and dahi'],
  ['Folate (B9)', 'Making new cells; important before and during pregnancy', 'Palak, methi, chana, daal'],
  ['Vitamin C', 'Immunity, skin, and absorbing iron from plants', 'Amrood (guava), kinnow and other citrus, tomatoes'],
  ['Vitamin A', 'Eyesight and immunity', 'Carrots, mango, sweet potato, palak, eggs'],
  ['Iron', 'Carries oxygen in the blood', 'Red meat, liver, daal, chana, palak (eat with vitamin C)'],
  ['Calcium', 'Bones, teeth, muscles and nerves', 'Milk, dahi, paneer, til (sesame), small fish eaten with bones'],
  ['Magnesium', 'Muscle and nerve function, energy', 'Nuts, seeds, whole grains, pulses, leafy greens'],
  ['Zinc', 'Immunity and healing', 'Meat, chana, pumpkin seeds, cashews'],
  ['Iodine', 'Thyroid function', 'Iodised salt'],
])}
${callout('Test, do not guess.', 'Low vitamin D and iron are widely reported in South Asia, but the only way to know your own levels is a blood test. Take supplements on a doctor’s advice, because too much of some vitamins and minerals (such as vitamin A, vitamin D and iron) can be harmful.')}`,
      },
      {
        id: 'electrolytes', title: 'Electrolytes', line: 'Sodium, potassium, magnesium and calcium keep your fluids, nerves and muscles working.',
        html: `<p>Electrolytes are minerals that carry an electric charge in your body fluids: mainly <b>sodium, potassium, chloride, magnesium and calcium</b>. They control fluid balance, nerve signals and muscle contractions, including your heartbeat.</p>
<ul><li><b>You lose them in sweat.</b> In a Pakistani summer, or during long training sessions, you lose fluid and sodium faster than usual.</li>
<li><b>Food replaces most of them.</b> Potassium: bananas, potatoes, daal, dates, dahi, coconut water. Magnesium and calcium: see the table above.</li>
<li><b>For heavy loss, use ORS.</b> After diarrhoea, vomiting or heavy sweating, oral rehydration salts made up exactly as the packet says are the safest choice.</li>
<li><b>Do not overdo salt.</b> The WHO recommends less than 5 g of salt a day (about one teaspoon) for adults. Too much sodium raises blood pressure.</li></ul>
${callout('Check first if you have a condition.', 'People with kidney disease, heart disease or high blood pressure should ask a doctor before using electrolyte drinks or supplements.')}`,
      },
      {
        id: 'adaptogens', title: 'Adaptogens', line: 'Herbs such as ashwagandha that may help with stress. Promising, but the evidence is limited.',
        html: `<p>Adaptogens are herbs said to help the body cope with stress. The best known are <b>ashwagandha</b>, <b>rhodiola</b>, <b>tulsi</b> (holy basil) and <b>ginseng</b>.</p>
<ul><li><b>What the research says.</b> Some small studies suggest ashwagandha may lower feelings of stress and help sleep. Most studies are short and small, and products vary a lot in strength and quality.</li>
<li><b>Safety.</b> Rare cases of liver injury have been reported with ashwagandha. It is not advised during pregnancy, and it can interact with thyroid, sedative, blood-sugar and immune-suppressing medicines.</li>
<li><b>Where they fit.</b> At best, an add-on. They do not replace sleep, training, food and managing the cause of the stress.</li></ul>
${callout('Before you try one.', 'Talk to a doctor or pharmacist, especially if you take any regular medicine, and buy from a reputable brand.')}`,
      },
    ],
  },

  Money: {
    intro: 'The Money pillar is about rules before moods: build a safe base, understand what each asset is, then invest with a plan. This covers the Pakistan Stock Exchange, stocks, gold and crypto in plain language.',
    sections: [
      {
        id: 'foundations', title: 'Before you invest', line: 'Emergency fund, no expensive debt, and a clear time horizon come first.',
        html: `<ol><li><b>Emergency fund.</b> Three to six months of essential expenses in cash or a savings account, so one shock does not force you to sell investments at a bad time.</li>
<li><b>Expensive debt.</b> Pay off high-interest debt such as credit cards before you invest.</li>
<li><b>Time horizon.</b> Money you need within two or three years should not be in volatile assets.</li>
<li><b>Position size.</b> Decide how much you can afford to lose on any one investment before you buy it.</li></ol>
<!--COMPOUND-->`,
      },
      {
        id: 'psx', title: 'PSX investing', line: 'Owning part of Pakistani companies through the Pakistan Stock Exchange, regulated by the SECP.',
        html: `<p>The Pakistan Stock Exchange (PSX) is where shares of Pakistani companies are bought and sold. Its main index is the <b>KSE-100</b>. The market is regulated by the <b>Securities and Exchange Commission of Pakistan (SECP)</b>.</p>
<ul><li><b>How to start.</b> Open an account with an SECP-licensed broker. Your shares are held in your name at the Central Depository Company (CDC).</li>
<li><b>How you earn.</b> From the share price rising and from dividends.</li>
<li><b>Simpler options.</b> Mutual funds and exchange-traded funds (ETFs), including Shariah-compliant ones, spread your money across many companies.</li>
<li><b>Tax.</b> Capital gains and dividends are taxed, and the rates change in the federal budget. Check the current rates with your broker or the FBR.</li></ul>
<p>Our <a href='/psx'>PSX Alpha</a> method shows how to research a company in five numbers.</p>`,
      },
      {
        id: 'stocks', title: 'Stocks', line: 'What owning a share means, and why spreading your money matters.',
        html: `<p>A share is a small piece of ownership in a company. When the company grows its profits over years, its shares tend to become more valuable. When it struggles, they can fall a long way.</p>
<ul><li><b>Diversify.</b> Owning many companies, directly or through a fund, means one failure does not sink you.</li>
<li><b>Think in years.</b> Prices move every day for many reasons. Long-term results depend on the business, the price you pay and your patience.</li>
<li><b>Foreign stocks.</b> Investing abroad from Pakistan is limited by State Bank of Pakistan foreign-exchange rules. Check what is allowed before using any overseas app or broker.</li></ul>`,
      },
      {
        id: 'gold', title: 'Gold', line: 'A traditional store of value in Pakistan. It pays no income, and its price can still fall.',
        html: `<p>Gold has been a store of value in Pakistani families for generations. In Pakistan it is usually priced per <b>tola</b> (about 11.66 g).</p>
<ul><li><b>What moves the price.</b> The international gold price in US dollars and the rupee-dollar exchange rate. When the rupee weakens, gold in rupees often rises.</li>
<li><b>No income.</b> Gold pays no dividends or profit. You earn only if the price rises.</li>
<li><b>Hidden costs.</b> Jewellery carries making charges you do not get back when you sell. Purity (24k or 22k), storage and safety all matter.</li>
<li><b>Where it fits.</b> Many investors hold a small share in gold as a hedge, not their whole savings.</li></ul>`,
      },
      {
        id: 'crypto', title: 'Crypto', line: 'Highly volatile digital assets that trade 24/7, with rules in Pakistan still changing.',
        html: `<p>Cryptocurrencies such as bitcoin and ether are digital assets recorded on public blockchains. Stablecoins try to track a currency such as the US dollar.</p>
<ul><li><b>Volatility.</b> Prices can rise or fall by large amounts in a single day, and the market never closes.</li>
<li><b>Custody risk.</b> If an exchange fails or your account is hacked, you may lose everything. Use strong passwords and two-factor authentication.</li>
<li><b>Scams.</b> Guaranteed returns, "signal" groups and people asking for your wallet keys are warning signs.</li>
<li><b>Rules in Pakistan.</b> The State Bank has long told banks not to deal in crypto. In 2025 the government began setting up a separate regulator for virtual assets. Check the current rules before you invest.</li></ul>
${callout('Size it small.', 'Only put in money you could lose completely without it changing your life. See <a href="/articles/crypto-and-psx-risk">Crypto and PSX need different risk rules</a>.')}`,
      },
      {
        id: 'compare', title: 'Side by side', line: 'How cash, PSX stocks, gold and crypto compare on income, risk and time horizon.',
        html: table(['', 'What you own', 'Income', 'Price swings', 'Main risks', 'Typical horizon'], [
          ['Cash and savings', 'A deposit with a bank or savings scheme', 'Profit or interest', 'None in rupees', 'Inflation eats its value', 'Any; for emergencies'],
          ['PSX stocks and funds', 'Part of real companies', 'Dividends', 'Medium to high', 'Company and market falls', '5 years or more'],
          ['Gold', 'A physical metal', 'None', 'Medium', 'Long flat or falling periods; making charges', 'Long term, as a hedge'],
          ['Crypto', 'A digital token', 'Usually none', 'Very high', 'Crashes, hacks, scams, changing rules', 'Only money you can lose'],
        ]) + `<p class='disclaimer'>Educational content only. Not financial advice. All investing carries risk, including the loss of capital.</p>`,
      },
    ],
  },
};
