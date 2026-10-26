(function () {
  var M = window.MoneyMentor;
  var assetList = document.getElementById("asset-list");

  // learn.js sets MoneyMentor only for logged-in users.
  if (!M || !assetList) {
    return;
  }

  // Students who haven't picked a topic yet go to the choose screen.
  if (!M.track) {
    window.location.href = "choose.html";
    return;
  }

  var START_CASH = 10000;
  var MAX_SHARES = 10000;
  var isCommodities = M.track === "commodities";
  var UNIT = isCommodities ? "unit" : "share";
  var storageKey = M.practiceKey;

  // Made-up investments. "drift" is the average monthly growth,
  // "risk" is how wildly the price jumps around each month.
  var STOCK_ASSETS = [
    { id: "index", name: "Broad Market Fund", info: "Holds hundreds of companies. Medium risk.", start: 100, drift: 0.007, risk: 0.04 },
    { id: "bond", name: "Safe Bond Fund", info: "Slow and steady. Low risk.", start: 50, drift: 0.003, risk: 0.01 },
    { id: "snack", name: "CrunchCo", info: "One snack company. Medium risk.", start: 40, drift: 0.006, risk: 0.05 },
    { id: "tech", name: "TechNova", info: "One tech company. High risk.", start: 80, drift: 0.01, risk: 0.09 },
    { id: "rocket", name: "RocketStart", info: "A brand-new company. Very high risk.", start: 20, drift: 0.01, risk: 0.16 }
  ];

  // Made-up commodity prices (they do not follow real markets).
  var COMMODITY_ASSETS = [
    { id: "gold", name: "Gold", info: "A metal people keep as a safe place for savings. Medium risk.", start: 100, drift: 0.004, risk: 0.035 },
    { id: "oil", name: "Crude Oil", info: "Fuel for cars and factories. Jumps with the news. High risk.", start: 60, drift: 0.003, risk: 0.08 },
    { id: "wheat", name: "Wheat", info: "Used for bread. Weather changes the price. Medium-high risk.", start: 30, drift: 0.002, risk: 0.06 },
    { id: "coffee", name: "Coffee", info: "Frost and drought can move the price a lot. High risk.", start: 45, drift: 0.004, risk: 0.09 },
    { id: "fund", name: "Mixed Commodity Fund", info: "A basket of many commodities. Medium risk.", start: 70, drift: 0.004, risk: 0.04 }
  ];

  var ASSETS = isCommodities ? COMMODITY_ASSETS : STOCK_ASSETS;

  var quantityInput = document.getElementById("quantity");
  var rows = {};
  var game = loadGame();

  function round2(number) {
    return Math.round(number * 100) / 100;
  }

  function money(number) {
    return number.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function signedMoney(number) {
    return (number >= 0 ? "+" : "-") + money(Math.abs(number));
  }

  // Random number that is usually near 0 (a bell curve).
  function randomNormal() {
    var u = 1 - Math.random();
    var v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function newGame(stats) {
    var fresh = {
      cash: START_CASH,
      month: 0,
      prices: {},
      prev: {},
      shares: {},
      stats: stats || { trades: 0, kinds: 0, months: 0 }
    };

    ASSETS.forEach(function (asset) {
      fresh.prices[asset.id] = asset.start;
      fresh.prev[asset.id] = asset.start;
      fresh.shares[asset.id] = 0;
    });

    return fresh;
  }

  // Load the saved game, ignoring anything that looks broken.
  function loadGame() {
    var saved = M.load(storageKey, null);
    var result = newGame();

    if (!saved || typeof saved !== "object") {
      return result;
    }

    if (Number.isFinite(saved.cash) && saved.cash >= 0) {
      result.cash = saved.cash;
    }

    if (Number.isInteger(saved.month) && saved.month >= 0) {
      result.month = saved.month;
    }

    ASSETS.forEach(function (asset) {
      var price = saved.prices ? saved.prices[asset.id] : null;
      var prev = saved.prev ? saved.prev[asset.id] : null;
      var owned = saved.shares ? saved.shares[asset.id] : null;

      if (Number.isFinite(price) && price > 0) {
        result.prices[asset.id] = price;
      }
      if (Number.isFinite(prev) && prev > 0) {
        result.prev[asset.id] = prev;
      }
      if (Number.isInteger(owned) && owned >= 0) {
        result.shares[asset.id] = owned;
      }
    });

    if (saved.stats && typeof saved.stats === "object") {
      result.stats.trades = Number(saved.stats.trades) || 0;
      result.stats.kinds = Number(saved.stats.kinds) || 0;
      result.stats.months = Number(saved.stats.months) || 0;
    }

    return result;
  }

  function persist() {
    M.save(storageKey, game);
  }

  function countHeld() {
    return ASSETS.filter(function (asset) {
      return game.shares[asset.id] > 0;
    }).length;
  }

  // ---------- Messages ----------
  function clearNotes() {
    ASSETS.forEach(function (asset) {
      rows[asset.id].note.textContent = "";
      rows[asset.id].note.className = "card-note";
    });
  }

  // Show the message on the card that was clicked.
  function say(asset, text, type) {
    clearNotes();
    M.showMessage("", "");
    rows[asset.id].note.textContent = text;
    rows[asset.id].note.className = "card-note " + type;
  }

  // ---------- Buying and selling ----------
  function readQuantity(asset) {
    var quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_SHARES) {
      say(asset, "Enter a whole number of " + UNIT + "s from 1 to " + MAX_SHARES + ".", "error");
      return null;
    }
    return quantity;
  }

  function buy(asset) {
    var quantity = readQuantity(asset);
    if (quantity === null) {
      return;
    }

    var cost = round2(game.prices[asset.id] * quantity);

    if (cost > game.cash) {
      say(asset, "Not enough cash. That costs " + money(cost) + " and you have " + money(game.cash) + ".", "error");
      return;
    }

    game.cash = round2(game.cash - cost);
    game.shares[asset.id] += quantity;
    game.stats.trades += 1;
    game.stats.kinds = Math.max(game.stats.kinds, countHeld());

    persist();
    render();
    say(asset, "Bought " + quantity + " for " + money(cost) + ".", "success");
  }

  function sell(asset) {
    var quantity = readQuantity(asset);
    if (quantity === null) {
      return;
    }

    if (quantity > game.shares[asset.id]) {
      say(asset, "You only own " + game.shares[asset.id] + " of these.", "error");
      return;
    }

    var earned = round2(game.prices[asset.id] * quantity);

    game.cash = round2(game.cash + earned);
    game.shares[asset.id] -= quantity;
    game.stats.trades += 1;

    persist();
    render();
    say(asset, "Sold " + quantity + " for " + money(earned) + ".", "success");
  }

  // ---------- Time passes ----------
  function nextMonth() {
    ASSETS.forEach(function (asset) {
      var old = game.prices[asset.id];
      var moved = old * (1 + asset.drift + asset.risk * randomNormal());

      game.prev[asset.id] = old;
      game.prices[asset.id] = Math.max(1, round2(moved));
    });

    game.month += 1;
    game.stats.months += 1;

    persist();
    render();
    clearNotes();
    M.showMessage("Month " + game.month + " is here. Check how your prices changed.", "success");
  }

  function startOver() {
    if (!window.confirm("Start over with " + money(START_CASH) + "? Your badges are kept.")) {
      return;
    }

    game = newGame(game.stats);
    persist();
    render();
    clearNotes();
    M.showMessage("Fresh start! You have " + money(START_CASH) + " again.", "success");
  }

  // ---------- Drawing the screen ----------
  function makeButton(label, kind, description, handler) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mini-btn " + kind;
    button.textContent = label;
    button.setAttribute("aria-label", description);
    button.addEventListener("click", handler);
    return button;
  }

  function buildCards() {
    ASSETS.forEach(function (asset) {
      var card = document.createElement("div");
      card.className = "asset-card";

      var title = document.createElement("h2");
      title.textContent = asset.name;

      var info = document.createElement("p");
      info.textContent = asset.info;
      var price = document.createElement("p");
      var change = document.createElement("p");
      var owned = document.createElement("p");
      var buttons = document.createElement("div");
      buttons.className = "card-buttons";
      buttons.appendChild(makeButton("Buy", "buy", "Buy " + UNIT + "s of " + asset.name, function () {
        buy(asset);
      }));
      buttons.appendChild(makeButton("Sell", "sell", "Sell " + UNIT + "s of " + asset.name, function () {
        sell(asset);
      }));

      var note = document.createElement("p");
      note.className = "card-note";
      note.setAttribute("role", "status");

      card.appendChild(title);
      card.appendChild(info);
      card.appendChild(price);
      card.appendChild(change);
      card.appendChild(owned);
      card.appendChild(buttons);
      card.appendChild(note);
      assetList.appendChild(card);

      rows[asset.id] = { price: price, change: change, owned: owned, note: note };
    });
  }

  function render() {
    var invested = 0;

    ASSETS.forEach(function (asset) {
      var price = game.prices[asset.id];
      var owned = game.shares[asset.id];
      var row = rows[asset.id];

      invested += price * owned;

      row.price.textContent = "Price: " + money(price) + " per " + UNIT;
      row.owned.textContent = "You own: " + owned + " (" + money(round2(price * owned)) + ")";

      if (game.month === 0) {
        row.change.textContent = "Last month: no change yet";
        row.change.className = "";
      } else {
        var percent = (price - game.prev[asset.id]) / game.prev[asset.id] * 100;
        row.change.textContent =
          "Last month: " + (percent >= 0 ? "▲ +" : "▼ -") + Math.abs(percent).toFixed(1) + "%";
        row.change.className = percent >= 0 ? "up" : "down";
      }
    });

    invested = round2(invested);
    var total = round2(game.cash + invested);
    var gain = round2(total - START_CASH);
    var gainBox = document.getElementById("sum-gain");

    document.getElementById("sum-month").textContent = game.month;
    document.getElementById("sum-cash").textContent = money(game.cash);
    document.getElementById("sum-invested").textContent = money(invested);
    document.getElementById("sum-total").textContent = money(total);
    gainBox.textContent = signedMoney(gain);
    gainBox.className = gain >= 0 ? "up" : "down";
  }

  document.getElementById("next-month-btn").addEventListener("click", nextMonth);
  document.getElementById("reset-btn").addEventListener("click", startOver);

  document.getElementById("quantity-label").textContent =
    (isCommodities ? "Units" : "Shares") + " per click";

  if (isCommodities) {
    document.getElementById("practice-note").textContent =
      "These prices are made up and do not follow real markets. This is practice, not financial advice.";
  }

  buildCards();
  render();
})();