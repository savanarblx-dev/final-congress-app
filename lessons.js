var LESSONS = [
  {
    id: 1, track: "stocks", title: "What is a stock?",
    text: "A stock is a small piece of ownership in a company. If you own a share of a company, you own a tiny part of it. If the company grows and earns money, your share can become worth more.",
    questions: [
      { q: "What does owning a stock mean?", options: ["You lent money to a company", "You own a small piece of a company", "You work for the company"], answer: 1 },
      { q: "When can a share become worth more?", options: ["When the company grows", "When the company closes", "Never"], answer: 0 }
    ]
  },
  {
    id: 2, track: "stocks", title: "Why do stock prices change?",
    text: "Prices change because of supply and demand. When more people want to buy a stock than sell it, the price goes up. When more people want to sell, the price goes down. News and company results affect what people want.",
    questions: [
      { q: "If lots of people want to buy a stock, the price usually...", options: ["Goes up", "Goes down", "Stays frozen"], answer: 0 },
      { q: "What can change how many people want a stock?", options: ["Company news", "The weather only", "Nothing"], answer: 0 }
    ]
  },
  {
    id: 3, track: "stocks", title: "Risk and reward",
    text: "Higher possible rewards usually come with higher risk. A stock can go up, but it can also go down, and you can lose money. Never invest money you need for important things like food or rent.",
    questions: [
      { q: "Can you lose money investing in stocks?", options: ["No, never", "Yes, it can happen", "Only on Mondays"], answer: 1 },
      { q: "Which money should you NOT invest?", options: ["Money you need for rent", "Money you can leave for years", "Spare savings"], answer: 0 }
    ]
  },
  {
    id: 4, track: "stocks", title: "Diversification",
    text: "Diversification means not putting all your money in one place. If you own many different investments, one bad one hurts less. This is like not putting all your eggs in one basket.",
    questions: [
      { q: "What does diversification mean?", options: ["Spreading money across many investments", "Buying one stock only", "Selling everything"], answer: 0 },
      { q: "Why is it helpful?", options: ["One bad investment hurts less", "It guarantees profit", "It removes all risk"], answer: 0 }
    ]
  },
  {
    id: 5, track: "stocks", title: "Long-term investing",
    text: "Prices go up and down every day, but over many years markets have tended to grow. Investing for the long term means staying patient instead of panicking when prices drop. Time is a big advantage for young investors.",
    questions: [
      { q: "Long-term investing means...", options: ["Being patient for years", "Trading every minute", "Quitting when prices drop"], answer: 0 },
      { q: "Who has time on their side?", options: ["Young investors", "Nobody", "Only experts"], answer: 0 }
    ]
  },
  {
    id: 6, track: "stocks", title: "Compound growth",
    text: "Compound growth means your earnings also earn money. If you invest $100 and it grows 10%, you have $110. Next year the 10% applies to $110, not $100. Over many years this snowball effect gets big.",
    questions: [
      { q: "$100 grows 10%. How much do you have?", options: ["$100", "$110", "$200"], answer: 1 },
      { q: "In compounding, earnings...", options: ["Also earn money", "Disappear", "Are taxed to zero"], answer: 0 }
    ]
  },
  {
    id: 7, track: "commodities", title: "What is a commodity?",
    text: "A commodity is a basic raw material that people use and trade, like gold, silver, oil, and wheat. One barrel of oil of a certain grade is basically the same as any other.",
    questions: [
      { q: "Which is a commodity?", options: ["Gold", "A pizza shop brand", "A video game"], answer: 0 },
      { q: "Commodities are...", options: ["Basic raw materials", "Only phone apps", "Company logos"], answer: 0 }
    ]
  },
  {
    id: 8, track: "commodities", title: "Gold and silver",
    text: "Gold and silver are precious metals. People buy them to store value, and silver is also used in electronics. Many investors buy gold when they feel the economy is uncertain.",
    questions: [
      { q: "Why do many people buy gold?", options: ["To store value", "To eat it", "To pay for lunch at school"], answer: 0 },
      { q: "Silver is also used in...", options: ["Electronics", "Clouds", "Nothing"], answer: 0 }
    ]
  },
  {
    id: 9, track: "commodities", title: "Oil and energy",
    text: "Oil is used to make fuel for cars, planes, and ships. Its price can change a lot because of how much is produced, world events, and how much people need. When oil gets expensive, gas prices often rise too.",
    questions: [
      { q: "Oil is mostly used for...", options: ["Fuel and energy", "Making paper", "Growing wheat"], answer: 0 },
      { q: "When oil gets expensive, gas prices often...", options: ["Rise", "Fall to zero", "Stay the same always"], answer: 0 }
    ]
  },
  {
    id: 10, track: "commodities", title: "Farm commodities",
    text: "Wheat, corn, and coffee are farm commodities. Their prices depend on harvests. A bad harvest means less supply, which can push prices up. A great harvest means more supply, which can push prices down.",
    questions: [
      { q: "A bad harvest usually makes prices...", options: ["Rise", "Fall", "Disappear"], answer: 0 },
      { q: "Which is a farm commodity?", options: ["Wheat", "Gold", "Oil"], answer: 0 }
    ]
  },
  {
    id: 11, track: "commodities", title: "Supply and demand",
    text: "Prices follow supply and demand. If supply is low and demand is high, prices rise. If supply is high and demand is low, prices fall. This rule works for every commodity.",
    questions: [
      { q: "Low supply and high demand makes prices...", options: ["Rise", "Fall", "Stay equal"], answer: 0 },
      { q: "High supply and low demand makes prices...", options: ["Rise", "Fall", "Double"], answer: 1 }
    ]
  },
  {
    id: 12, track: "commodities", title: "Commodity risks",
    text: "Commodity prices can swing fast because of weather, wars, and new technology. That makes them risky. Many investors keep only a small part of their money in commodities and spread the rest around.",
    questions: [
      { q: "Commodity prices can swing because of...", options: ["Weather and world events", "Nothing at all", "Only school schedules"], answer: 0 },
      { q: "A smart way to handle the risk is to...", options: ["Put everything in one commodity", "Keep only a small part and diversify", "Borrow money to buy more"], answer: 1 }
    ]
  }
];