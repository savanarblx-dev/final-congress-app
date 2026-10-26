(function () {
  // Only logged-in users can see these screens.
  var userName = sessionStorage.getItem("currentUser");

  if (!userName) {
    window.location.href = "login.html";
    return;
  }

  // Everything is saved in this browser, separately for each name.
  var progressKey = "progress-" + userName;
  var trackKey = "track-" + userName;

  // The topics a student can pick. Lessons with no "track" count as stocks.
  var TRACK_IDS = ["stocks", "commodities"];
  var TRACKS = {
    stocks: {
      icon: "📈",
      name: "Stocks",
      description: "Own a small piece of a company, and learn about funds, compounding, and risk."
    },
    commodities: {
      icon: "🛢️",
      name: "Commodities",
      description: "Learn about gold, oil, wheat, and other raw materials that people buy and sell."
    }
  };

  function load(key, fallback) {
    try {
      var saved = JSON.parse(localStorage.getItem(key));
      return saved === null ? fallback : saved;
    } catch (error) {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function showMessage(text, type) {
    var message = document.getElementById("message");
    if (message) {
      message.textContent = text;
      message.className = type;
    }
  }

  // ---------- Topics ----------
  function getTrack() {
    var saved = load(trackKey, null);
    return TRACK_IDS.indexOf(saved) === -1 ? null : saved;
  }

  function trackOf(lesson) {
    return lesson.track || "stocks";
  }

  function lessonsForTrack(trackId) {
    return LESSONS.filter(function (lesson) {
      return trackOf(lesson) === trackId;
    });
  }

  // Stocks keeps the old save name so earlier practice games still work.
  function practiceKeyFor(trackId) {
    if (trackId === "stocks") {
      return "practice-" + userName;
    }
    return "practice-" + trackId + "-" + userName;
  }

  var currentTrack = getTrack();

  // practice.js uses these, so share them.
  window.MoneyMentor = {
    userName: userName,
    track: currentTrack,
    practiceKey: currentTrack ? practiceKeyFor(currentTrack) : null,
    load: load,
    save: save,
    showMessage: showMessage
  };

  // ---------- Lesson progress ----------
  function getDone() {
    var saved = load(progressKey, []);

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter(function (id) {
      return LESSONS.some(function (lesson) {
        return lesson.id === id;
      });
    });
  }

  function markDone(id) {
    var done = getDone();
    if (done.indexOf(id) === -1) {
      done.push(id);
      save(progressKey, done);
    }
  }

  function countDoneIn(trackId, done) {
    return lessonsForTrack(trackId).filter(function (lesson) {
      return done.indexOf(lesson.id) !== -1;
    }).length;
  }

  function isTrackComplete(trackId, done) {
    var total = lessonsForTrack(trackId).length;
    return total > 0 && countDoneIn(trackId, done) === total;
  }

  // ---------- Badges ----------
  function getStats() {
    var done = getDone();
    var trades = 0;
    var kinds = 0;
    var months = 0;

    // Add up practice activity from both topics.
    TRACK_IDS.forEach(function (trackId) {
      var practice = load(practiceKeyFor(trackId), {});
      var stats = practice && practice.stats ? practice.stats : {};

      trades = trades + (Number(stats.trades) || 0);
      kinds = Math.max(kinds, Number(stats.kinds) || 0);
      months = months + (Number(stats.months) || 0);
    });

    return {
      lessonsDone: done.length,
      topicDone: TRACK_IDS.some(function (trackId) {
        return isTrackComplete(trackId, done);
      }),
      trades: trades,
      kinds: kinds,
      months: months
    };
  }

  var BADGES = [
    {
      icon: "🌱",
      name: "First Step",
      info: "Finish 1 lesson",
      earned: function (s) { return s.lessonsDone >= 1; }
    },
    {
      icon: "📚",
      name: "Halfway There",
      info: "Finish 3 lessons",
      earned: function (s) { return s.lessonsDone >= 3; }
    },
    {
      icon: "🎓",
      name: "Investing Graduate",
      info: "Finish every lesson in a topic",
      earned: function (s) { return s.topicDone; }
    },
    {
      icon: "🧪",
      name: "Paper Trader",
      info: "Make your first practice trade",
      earned: function (s) { return s.trades >= 1; }
    },
    {
      icon: "🧺",
      name: "Diversifier",
      info: "Own 3 different practice investments at once",
      earned: function (s) { return s.kinds >= 3; }
    },
    {
      icon: "⏳",
      name: "Patient Investor",
      info: "Play 12 months in practice",
      earned: function (s) { return s.months >= 12; }
    }
  ];

  function countEarnedBadges() {
    var stats = getStats();
    return BADGES.filter(function (badge) {
      return badge.earned(stats);
    }).length;
  }

  // ---------- Choose screen: stocks or commodities ----------
  function setupChoose() {
    var list = document.getElementById("track-list");
    if (!list) {
      return;
    }

    var done = getDone();

    TRACK_IDS.forEach(function (trackId) {
      var info = TRACKS[trackId];
      var total = lessonsForTrack(trackId).length;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "track-card" + (trackId === currentTrack ? " current" : "");

      var icon = document.createElement("span");
      icon.className = "track-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = info.icon;

      var text = document.createElement("div");

      var name = document.createElement("strong");
      name.textContent = info.name;

      var description = document.createElement("p");
      description.textContent = info.description;

      var progress = document.createElement("p");
      progress.className = "track-progress";
      progress.textContent = countDoneIn(trackId, done) + " of " + total + " lessons done";

      text.appendChild(name);
      text.appendChild(description);
      text.appendChild(progress);
      button.appendChild(icon);
      button.appendChild(text);

      button.addEventListener("click", function () {
        save(trackKey, trackId);
        window.location.href = "home.html";
      });

      list.appendChild(button);
    });
  }

  // ---------- Home screen ----------
  function setupHome() {
    var list = document.getElementById("lesson-list");
    if (!list) {
      return;
    }

    // Students who haven't picked a topic yet go to the choose screen.
    if (!currentTrack) {
      window.location.href = "choose.html";
      return;
    }

    var info = TRACKS[currentTrack];
    var lessons = lessonsForTrack(currentTrack);
    var done = getDone();

    document.getElementById("tagline").textContent =
      "Your topic: " + info.icon + " " + info.name;

    lessons.forEach(function (lesson, position) {
      var isDone = done.indexOf(lesson.id) !== -1;

      var link = document.createElement("a");
      link.href = "lesson.html?id=" + lesson.id;
      link.className = "lesson-card";
      link.textContent = (isDone ? "✅ " : "📘 ") + (position + 1) + ". " + lesson.title;
      list.appendChild(link);
    });

    document.getElementById("progress-text").textContent =
      countDoneIn(currentTrack, done) + " of " + lessons.length + " lessons done · " +
      countEarnedBadges() + " of " + BADGES.length + " badges";
  }

  // ---------- Lesson screen: text + quiz ----------
  function setupLesson() {
    var optionsBox = document.getElementById("quiz-options");
    if (!optionsBox) {
      return;
    }

    var id = Number(new URLSearchParams(window.location.search).get("id"));
    var lesson = LESSONS.find(function (item) {
      return item.id === id;
    });

    if (!lesson) {
      window.location.href = "home.html";
      return;
    }

    document.title = lesson.title + " - MoneyMentor";
    document.getElementById("lesson-title").textContent = lesson.title;

    var textBox = document.getElementById("lesson-text");
    lesson.text.forEach(function (paragraph) {
      var p = document.createElement("p");
      p.textContent = paragraph;
      textBox.appendChild(p);
    });

    var progressLabel = document.getElementById("quiz-progress");
    var questionTitle = document.getElementById("quiz-question");
    var nextQuestionButton = document.getElementById("question-btn");
    var nextButton = document.getElementById("next-btn");

    // "Next lesson" stays inside the same topic.
    var sameTopic = lessonsForTrack(trackOf(lesson));
    var nextLesson = sameTopic[sameTopic.indexOf(lesson) + 1];

    if (nextLesson) {
      nextButton.href = "lesson.html?id=" + nextLesson.id;
      nextButton.textContent = "Next lesson";
    } else {
      nextButton.href = "home.html";
      nextButton.textContent = "Finish";
    }

    var questionIndex = 0;

    function showQuestion() {
      var current = lesson.questions[questionIndex];

      progressLabel.textContent =
        "Question " + (questionIndex + 1) + " of " + lesson.questions.length;
      questionTitle.textContent = current.question;
      optionsBox.textContent = "";
      nextQuestionButton.hidden = true;
      showMessage("", "");

      current.options.forEach(function (optionText, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "option";
        button.textContent = optionText;

        button.addEventListener("click", function () {
          if (index !== current.answer) {
            button.disabled = true;
            button.classList.add("wrong");
            showMessage("Not quite. Read the lesson again and try another answer.", "error");

            // Keep the keyboard focus on a button that still works.
            var stillOpen = optionsBox.querySelector("button:not(:disabled)");
            if (stillOpen) {
              stillOpen.focus();
            }
            return;
          }

          button.classList.add("correct");
          optionsBox.querySelectorAll("button").forEach(function (b) {
            b.disabled = true;
          });

          if (questionIndex < lesson.questions.length - 1) {
            showMessage("Correct! On to the next question.", "success");
            nextQuestionButton.hidden = false;
            nextQuestionButton.focus();
          } else {
            markDone(lesson.id);
            showMessage("Correct! Lesson complete.", "success");
            nextButton.hidden = false;
            nextButton.focus();
          }
        });

        optionsBox.appendChild(button);
      });
    }

    nextQuestionButton.addEventListener("click", function () {
      questionIndex = questionIndex + 1;
      showQuestion();
      questionTitle.focus();
    });

    showQuestion();
  }

  // ---------- Badges screen ----------
  function setupBadges() {
    var list = document.getElementById("badge-list");
    if (!list) {
      return;
    }

    var stats = getStats();
    var earnedCount = 0;

    BADGES.forEach(function (badge) {
      var earned = badge.earned(stats);
      if (earned) {
        earnedCount = earnedCount + 1;
      }

      var card = document.createElement("div");
      card.className = "badge-card " + (earned ? "earned" : "locked");

      var icon = document.createElement("span");
      icon.className = "badge-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = earned ? badge.icon : "🔒";

      var text = document.createElement("div");

      var name = document.createElement("strong");
      name.textContent = badge.name;

      var info = document.createElement("p");
      info.textContent = badge.info + (earned ? " - Earned!" : " - Locked");

      text.appendChild(name);
      text.appendChild(info);
      card.appendChild(icon);
      card.appendChild(text);
      list.appendChild(card);
    });

    document.getElementById("badge-count").textContent =
      earnedCount + " of " + BADGES.length + " badges earned";
  }

  // ---------- Calculator screen ----------
  function setupCalculator() {
    var form = document.getElementById("calc-form");
    if (!form) {
      return;
    }

    function money(number) {
      return number.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var start = parseFloat(document.getElementById("start").value);
      var monthly = parseFloat(document.getElementById("monthly").value);
      var rate = parseFloat(document.getElementById("rate").value);
      var years = parseInt(document.getElementById("years").value, 10);
      var result = document.getElementById("result");

      result.hidden = true;

      if (isNaN(start) || isNaN(monthly) || isNaN(rate) || isNaN(years)) {
        showMessage("Please fill out every box with a number.", "error");
        return;
      }

      if (start < 0 || monthly < 0 || rate < 0 || rate > 30) {
        showMessage("Use positive numbers, and a return between 0 and 30%.", "error");
        return;
      }

      if (years < 1 || years > 60) {
        showMessage("Years must be between 1 and 60.", "error");
        return;
      }

      var monthlyRate = rate / 100 / 12;
      var balance = start;

      for (var month = 0; month < years * 12; month++) {
        balance = balance * (1 + monthlyRate) + monthly;
      }

      var putIn = start + monthly * years * 12;

      document.getElementById("result-total").textContent = money(balance);
      document.getElementById("result-put-in").textContent = money(putIn);
      document.getElementById("result-growth").textContent = money(balance - putIn);

      showMessage("", "");
      result.hidden = false;
    });
  }

  setupChoose();
  setupHome();
  setupLesson();
  setupBadges();
  setupCalculator();
})();