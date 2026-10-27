(function () {
  var USERS_KEY = "users";
  var MIN_AGE = 13;
  var MAX_AGE = 120;

  // Saved accounts are stored on browser
  function getUsers() {
    try {
      var saved = JSON.parse(localStorage.getItem(USERS_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  // Returns false if the browser would not let us save.
  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      return false;
    }
  }

  function showMessage(text, type) {
    var message = document.getElementById("message");
    if (message) {
      message.textContent = text;
      message.className = type;
    }
  }

  // Date helpers(calender)
  function twoDigits(number) {
    return String(number).padStart(2, "0");
  }

  function todayString() {
    var now = new Date();
    return now.getFullYear() + "-" + twoDigits(now.getMonth() + 1) + "-" + twoDigits(now.getDate());
  }

  // Turns "2008-05-17" into numbers, or null if it is not a real date.
  function parseDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return { year: year, month: month, day: day };
  }

  // Age in years, counting the birthday only once it has happened this year so that age is accrate
  function getAge(birth) {
    var now = new Date();
    var age = now.getFullYear() - birth.year;
    var month = now.getMonth() + 1;

    if (month < birth.month || (month === birth.month && now.getDate() < birth.day)) {
      age = age - 1;
    }
    return age;
  }

  // ---------- Sign up ----------
  function setupSignup() {
    var form = document.getElementById("signup-form");
    if (!form) {
      return;
    }

    var birthInput = document.getElementById("birthday");
    birthInput.max = todayString();

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("name").value.trim();
      var email = document.getElementById("email").value.trim().toLowerCase();
      var birthday = document.getElementById("birthday").value;
      var password = document.getElementById("password").value;
      var confirm = document.getElementById("confirm").value;

      if (!name || !email || !birthday || !password || !confirm) {
        showMessage("Please fill out every box.", "error");
        return;
      }

      if (name.length < 2 || name.length > 30) {
        showMessage("Your name must be 2 to 30 characters long.", "error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("That email does not look right.", "error");
        return;
      }

      var birth = parseDate(birthday);
      if (!birth) {
        showMessage("Please pick a real date of birth.", "error");
        return;
      }

      var age = getAge(birth);
      if (age < 0) {
        showMessage("Your date of birth cannot be in the future.", "error");
        return;
      }
      if (age > MAX_AGE) {
        showMessage("Please check your date of birth.", "error");
        return;
      }
      if (age < MIN_AGE) {
        showMessage("You need to be at least " + MIN_AGE + " to sign up.", "error");
        return;
      }

      if (password.length < 6) {
        showMessage("Your password must be at least 6 characters.", "error");
        return;
      }

      if (password !== confirm) {
        showMessage("The passwords do not match.", "error");
        return;
      }

      var users = getUsers();

      var emailTaken = users.some(function (user) {
        return user.email === email;
      });
      if (emailTaken) {
        showMessage("There is already an account with that email.", "error");
        return;
      }

      // Progress is saved by name, so every name must be different no duplicate sign ups
      var nameTaken = users.some(function (user) {
        return String(user.name).toLowerCase() === name.toLowerCase();
      });
      if (nameTaken) {
        showMessage("That name is taken. Try another one.", "error");
        return;
      }

      users.push({ name: name, email: email, password: password, birthday: birthday });

      if (!saveUsers(users)) {
        showMessage("Your browser would not save the account. Check that storage is allowed.", "error");
        return;
      }

      form.querySelector("button[type='submit']").disabled = true;
      showMessage("Account created! Taking you to login...", "success");

      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);
    });
  }

  //  Login 
  function setupLogin() {
    var form = document.getElementById("login-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = document.getElementById("email").value.trim().toLowerCase();
      var password = document.getElementById("password").value;

      if (!email || !password) {
        showMessage("Please enter your email and password.", "error");
        return;
      }

      var match = getUsers().find(function (user) {
        return user.email === email && user.password === password;
      });

      if (!match) {
        showMessage("Wrong email or password.", "error");
        return;
      }

      sessionStorage.setItem("currentUser", match.name);
      window.location.href = "choose.html";
    });
  }

  // Pages after login: welcome name + logout
  function setupAccountBar() {
    var nameBox = document.getElementById("welcome-name");
    if (nameBox) {
      nameBox.textContent = sessionStorage.getItem("currentUser") || "";
    }

    var logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html";
      });
    }
  }

  setupSignup();
  setupLogin();
  setupAccountBar();
})();
