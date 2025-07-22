"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var UserStatus;

(function (UserStatus) {
  UserStatus["LoggedIn"] = "Logged In";
  UserStatus["LoggingIn"] = "Logging In";
  UserStatus["LoggedOut"] = "Logged Out";
  UserStatus["LogInError"] = "Log In Error";
  UserStatus["VerifyingLogIn"] = "Verifying Log In";
})(UserStatus || (UserStatus = {}));

var Default;

(function (Default) {
  Default["PIN"] = "9999";
})(Default || (Default = {}));

var WeatherType;

(function (WeatherType) {
  WeatherType["Cloudy"] = "Cloudy";
  WeatherType["Rainy"] = "Rainy";
  WeatherType["Stormy"] = "Stormy";
  WeatherType["Sunny"] = "Sunny";
})(WeatherType || (WeatherType = {}));

var defaultPosition = function defaultPosition() {
  return {
    left: 0,
    x: 0
  };
};

var N = {
  clamp: function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
  },
  rand: function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};
var T = {
  format: function format(date) {
    var hours = T.formatHours(date.getHours()),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();
    return "".concat(hours, ":").concat(T.formatSegment(minutes));
  },
  formatHours: function formatHours(hours) {
    return hours % 12 === 0 ? 12 : hours % 12;
  },
  formatSegment: function formatSegment(segment) {
    return segment < 10 ? "0".concat(segment) : segment;
  }
};
var LogInUtility = {
  verify: function verify(pin) {
    return regeneratorRuntime.async(function verify$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              setTimeout(function () {
                if (pin === Default.PIN) {
                  resolve(true);
                } else {
                  reject("Invalid pin: ".concat(pin));
                }
              }, N.rand(300, 700));
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    });
  }
};

var useCurrentDateEffect = function useCurrentDateEffect() {
  var _React$useState = React.useState(new Date()),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      date = _React$useState2[0],
      setDate = _React$useState2[1];

  React.useEffect(function () {
    var interval = setInterval(function () {
      var update = new Date();

      if (update.getSeconds() !== date.getSeconds()) {
        setDate(update);
      }
    }, 100);
    return function () {
      return clearInterval(interval);
    };
  }, [date]);
  return date;
};

var ScrollableComponent = function ScrollableComponent(props) {
  var ref = React.useRef(null);

  var _React$useState3 = React.useState({
    grabbing: false,
    position: defaultPosition()
  }),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      state = _React$useState4[0],
      setStateTo = _React$useState4[1];

  var handleOnMouseDown = function handleOnMouseDown(e) {
    setStateTo(Object.assign(Object.assign({}, state), {
      grabbing: true,
      position: {
        x: e.clientX,
        left: ref.current.scrollLeft
      }
    }));
  };

  var handleOnMouseMove = function handleOnMouseMove(e) {
    if (state.grabbing) {
      var left = Math.max(0, state.position.left + (state.position.x - e.clientX));
      ref.current.scrollLeft = left;
    }
  };

  var handleOnMouseUp = function handleOnMouseUp() {
    if (state.grabbing) {
      setStateTo(Object.assign(Object.assign({}, state), {
        grabbing: false
      }));
    }
  };

  return React.createElement("div", {
    ref: ref,
    className: classNames("scrollable-component", props.className),
    id: props.id,
    onMouseDown: handleOnMouseDown,
    onMouseMove: handleOnMouseMove,
    onMouseUp: handleOnMouseUp,
    onMouseLeave: handleOnMouseUp
  }, props.children);
};

var WeatherSnap = function WeatherSnap() {
  var date = useCurrentDateEffect();
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var dayName = days[date.getDay()];
  var day = T.formatSegment(date.getDate());
  var month = T.formatSegment(date.getMonth() + 1);
  var year = date.getFullYear();
  return React.createElement("div", {
    className: "weather",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "left",
      justifyContent: "center",
      fontFamily: "Rubik, sans-serif",
      fontSize: "18px",
      fontWeight: "400",
      color: "#fff",
      marginBottom: "20px",
      lineHeight: "1.6",
      textAlign: "left",
      textShadow: "0 0 5px rgba(0,0,0,0.4)"
    }
  }, React.createElement("div", {
    className: "weather-day"
  }, dayName), React.createElement("div", {
    className: "weather-date"
  }, "".concat(month, "/").concat(day, "/").concat(year)));
};

var Reminder = function Reminder() {
  return React.createElement("div", {
    className: "reminder"
  }, React.createElement("div", {
    className: "reminder-icon"
  }, React.createElement("i", {
    className: "fa-regular fa-bell"
  })), React.createElement("span", {
    className: "reminder-text"
  }, "Decisions are the keys to the future. ", React.createElement("span", {
    className: "reminder-time"
  }, "")));
};

var Time = function Time() {
  var date = useCurrentDateEffect();
  return React.createElement("span", {
    className: "time"
  }, T.format(date));
};

var Info = function Info(props) {
  return React.createElement("div", {
    id: props.id,
    className: "info"
  }, React.createElement(Time, null), React.createElement(WeatherSnap, null));
};

var PinDigit = function PinDigit(props) {
  var _React$useState5 = React.useState(false),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      hidden = _React$useState6[0],
      setHiddenTo = _React$useState6[1];

  React.useEffect(function () {
    if (props.value) {
      var timeout = setTimeout(function () {
        setHiddenTo(true);
      }, 500);
      return function () {
        setHiddenTo(false);
        clearTimeout(timeout);
      };
    }
  }, [props.value]);
  return React.createElement("div", {
    className: classNames("app-pin-digit", {
      focused: props.focused,
      hidden: hidden
    })
  }, React.createElement("span", {
    className: "app-pin-digit-value"
  }, props.value || ""));
};

var Pin = function Pin() {
  var _React$useContext = React.useContext(AppContext),
      userStatus = _React$useContext.userStatus,
      setUserStatusTo = _React$useContext.setUserStatusTo;

  var _React$useState7 = React.useState(""),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      pin = _React$useState8[0],
      setPinTo = _React$useState8[1];

  var ref = React.useRef(null);
  React.useEffect(function () {
    if (userStatus === UserStatus.LoggingIn || userStatus === UserStatus.LogInError) {
      ref.current.focus();
    } else {
      setPinTo("");
    }
  }, [userStatus]);
  React.useEffect(function () {
    if (pin.length === 4) {
      var verify = function verify() {
        return regeneratorRuntime.async(function verify$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                setUserStatusTo(UserStatus.VerifyingLogIn);
                _context2.next = 4;
                return regeneratorRuntime.awrap(LogInUtility.verify(pin));

              case 4:
                if (!_context2.sent) {
                  _context2.next = 6;
                  break;
                }

                setUserStatusTo(UserStatus.LoggedIn);

              case 6:
                _context2.next = 12;
                break;

              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](0);
                console.error(_context2.t0);
                setUserStatusTo(UserStatus.LogInError);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, null, null, [[0, 8]]);
      };

      verify();
    }

    if (userStatus === UserStatus.LogInError) {
      setUserStatusTo(UserStatus.LoggingIn);
    }
  }, [pin]);

  var handleOnClick = function handleOnClick() {
    ref.current.focus();
  };

  var handleOnCancel = function handleOnCancel() {
    setUserStatusTo(UserStatus.LoggedOut);
  };

  var handleOnChange = function handleOnChange(e) {
    if (e.target.value.length <= 4) {
      setPinTo(e.target.value.toString());
    }
  };

  var getCancelText = function getCancelText() {
    React.useEffect(function () {
      var handleKeyDown = function handleKeyDown(e) {
        if (e.key === "Escape") {
          handleOnCancel();
        }

        if (e.key === " " || e.key === "Spacebar") {
          if (ref.current && userStatus === UserStatus.LoggedOut) {
            setUserStatusTo(UserStatus.LoggingIn);
            ref.current.focus();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return function () {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [userStatus]);
    return React.createElement("span", {
      id: "app-pin-cancel-text",
      onClick: handleOnCancel
    }, "");
  };

  var getErrorText = function getErrorText() {
    if (userStatus === UserStatus.LogInError) {
      return React.createElement("span", {
        id: "app-pin-error-text"
      }, " Invalid");
    }
  };

  return React.createElement("div", {
    id: "app-pin-wrapper"
  }, React.createElement("input", {
    disabled: userStatus !== UserStatus.LoggingIn && userStatus !== UserStatus.LogInError,
    id: "app-pin-hidden-input",
    maxLength: 4,
    ref: ref,
    type: "number",
    value: pin,
    onChange: handleOnChange
  }), React.createElement("div", {
    id: "app-pin",
    onClick: handleOnClick
  }, React.createElement(PinDigit, {
    focused: pin.length === 0,
    value: pin[0]
  }), React.createElement(PinDigit, {
    focused: pin.length === 1,
    value: pin[1]
  }), React.createElement(PinDigit, {
    focused: pin.length === 2,
    value: pin[2]
  }), React.createElement(PinDigit, {
    focused: pin.length === 3,
    value: pin[3]
  })), React.createElement("h3", {
    id: "app-pin-label"
  }, "Enter PIN", getErrorText(), " ", getCancelText()));
};

var MenuSection = function MenuSection(props) {
  var getContent = function getContent() {
    if (props.scrollable) {
      return React.createElement(ScrollableComponent, {
        className: "menu-section-content"
      }, props.children);
    }

    return React.createElement("div", {
      className: "menu-section-content"
    }, props.children);
  };

  return React.createElement("div", {
    id: props.id,
    className: "menu-section"
  }, React.createElement("div", {
    className: "menu-section-title"
  }, React.createElement("i", {
    className: props.icon
  }), React.createElement("span", {
    className: "menu-section-title-text"
  }, props.title)), getContent());
};

var QuickNav = function QuickNav() {
  var getItems = function getItems() {
    return [{
      id: 1,
      label: "ChatGpt",
      href: "https://chat.openai.com/"
    }, {
      id: 2,
      label: "Gemini",
      href: "https://gemini.google.com/"
    }, {
      id: 3,
      label: "Perplexity",
      href: "https://www.perplexity.ai/"
    }, {
      id: 4,
      label: "DeepSeek",
      href: "https://chat.deepseek.com/"
    }].map(function (item) {
      return React.createElement("a", {
        key: item.id,
        className: "quick-nav-item clear-button",
        href: item.href,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          textDecoration: "none"
        }
      }, React.createElement("span", {
        className: "quick-nav-item-label"
      }, item.label));
    });
  };

  return React.createElement(ScrollableComponent, {
    id: "quick-nav"
  }, getItems());
};

var Weather = function Weather() {
  var getDays = function getDays() {
    return [{
      id: 1,
      name: "Mon",
      temperature: N.rand(60, 80),
      weather: WeatherType.Sunny
    }, {
      id: 2,
      name: "Tues",
      temperature: N.rand(60, 80),
      weather: WeatherType.Sunny
    }, {
      id: 3,
      name: "Wed",
      temperature: N.rand(60, 80),
      weather: WeatherType.Cloudy
    }, {
      id: 4,
      name: "Thurs",
      temperature: N.rand(60, 80),
      weather: WeatherType.Rainy
    }, {
      id: 5,
      name: "Fri",
      temperature: N.rand(60, 80),
      weather: WeatherType.Stormy
    }, {
      id: 6,
      name: "Sat",
      temperature: N.rand(60, 80),
      weather: WeatherType.Sunny
    }, {
      id: 7,
      name: "Sun",
      temperature: N.rand(60, 80),
      weather: WeatherType.Cloudy
    }].map(function (day) {
      var getIcon = function getIcon() {
        switch (day.weather) {
          case WeatherType.Cloudy:
            return "fa-duotone fa-clouds";

          case WeatherType.Rainy:
            return "fa-duotone fa-cloud-drizzle";

          case WeatherType.Stormy:
            return "fa-duotone fa-cloud-bolt";

          case WeatherType.Sunny:
            return "fa-duotone fa-sun";
        }
      };

      return React.createElement("div", {
        key: day.id,
        className: "day-card"
      }, React.createElement("div", {
        className: "day-card-content"
      }, React.createElement("span", {
        className: "day-weather-temperature"
      }, day.temperature, React.createElement("span", {
        className: "day-weather-temperature-unit"
      }, "\xB0F")), React.createElement("i", {
        className: classNames("day-weather-icon", getIcon(), day.weather.toLowerCase())
      }), React.createElement("span", {
        className: "day-name"
      }, day.name)));
    });
  };

  return React.createElement(MenuSection, {
    icon: "fa-solid fa-sun",
    id: "weather-section",
    scrollable: true,
    title: "",
    style: {
      display: 'none'
    }
  }, getDays());
};

var Tools = function Tools() {
  var getTools = function getTools() {
    return [{
      icon: "fa-solid fa-cloud-sun",
      id: 1,
      image: "https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHdlYXRoZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
      label: "Weather",
      name: "Cloudly"
    }, {
      icon: "fa-solid fa-calculator-simple",
      id: 2,
      image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y2FsY3VsYXRvcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      label: "Calc",
      name: "Mathio"
    }, {
      icon: "fa-solid fa-piggy-bank",
      id: 3,
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YmFua3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      label: "Bank",
      name: "Cashy"
    }, {
      icon: "fa-solid fa-plane",
      id: 4,
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWlycGxhbmV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
      label: "Travel",
      name: "Fly-er-io-ly"
    }, {
      icon: "fa-solid fa-gamepad-modern",
      id: 5,
      image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dmlkZW8lMjBnYW1lc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      label: "Games",
      name: "Gamey"
    }, {
      icon: "fa-solid fa-video",
      id: 6,
      image: "https://images.unsplash.com/photo-1578022761797-b8636ac1773c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpZGVvJTIwY2hhdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      label: "Video Chat",
      name: "Chatty"
    }].map(function (tool) {
      var styles = {
        backgroundImage: "url(".concat(tool.image, ")")
      };
      return React.createElement("div", {
        key: tool.id,
        className: "tool-card"
      }, React.createElement("div", {
        className: "tool-card-background background-image",
        style: styles
      }), React.createElement("div", {
        className: "tool-card-content"
      }, React.createElement("div", {
        className: "tool-card-content-header"
      }, React.createElement("span", {
        className: "tool-card-label"
      }, tool.label), React.createElement("span", {
        className: "tool-card-name"
      }, tool.name)), React.createElement("i", {
        className: classNames(tool.icon, "tool-card-icon")
      })));
    });
  };

  return React.createElement(MenuSection, {
    icon: "fa-solid fa-toolbox",
    id: "tools-section",
    title: "What's Appening?"
  }, getTools());
};

var Restaurants = function Restaurants() {
  var getTimeSlot = function getTimeSlot() {
    var hour = new Date().getHours();
    if (hour >= 4 && hour < 8) return "Early Morning";
    if (hour >= 8 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 20) return "Evening";
    return "Night";
  };

  var getRandomGif = function getRandomGif(slot) {
    var gifs = {
      "Early Morning": ["https://media.tenor.com/JtSRclSkblsAAAAC/good-morning-sunrise.gif", "https://media.tenor.com/qNz64tMyv8IAAAAC/morning-rise-and-shine.gif"],
      "Morning": ["https://media.tenor.com/Xggp5yIgx9EAAAAC/good-morning-coffee.gif", "https://media.tenor.com/v54ZlmzS5YoAAAAd/morning.gif"],
      "Afternoon": ["https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHhjMjgybjQzbGg3ZmpmaXc2MWJtcDg3cTFldGE5d2p4YW03NHRlcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0wlvGLHmojbeu5vq/giphy.gif", "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZubHR5czFvMjdydWU2aDFpN2M2ZGt4ejV0Y3F2M3ZnNzI2emh0diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/hrJj4LarGeUCs/giphy.webp"],
      "Evening": ["https://media.tenor.com/CwW5yRjIfd0AAAAd/good-evening.gif", "https://media.tenor.com/oPOAxjWhV7sAAAAC/evening-mountains.gif"],
      "Night": ["https://media.tenor.com/o-Y77AoVq2EAAAAC/good-night-sweet-dreams.gif", "https://media.tenor.com/FYAb0RTA1pQAAAAC/good-night-moon.gif"]
    };
    var available = gifs[slot] || [];
    return available[Math.floor(Math.random() * available.length)];
  };

  var timeSlot = getTimeSlot();
  var gifUrl = getRandomGif(timeSlot);
  var containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px"
  };
  var cardStyle = {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px"
  };
  var mediaWrapperStyle = {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%",
    // 16:9 aspect ratio
    height: 0,
    overflow: "hidden",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)"
  };
  var iframeStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "0",
    borderRadius: "12px"
  };
  var imgStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "12px"
  };
  return React.createElement("div", {
    style: containerStyle
  }, [// 🎵 Spotify Tile
  React.createElement("div", {
    key: "spotify-tile",
    style: cardStyle
  }, React.createElement("h3", {
    style: {
      marginBottom: "10px",
      fontSize: "1.2rem"
    }
  }, ""), React.createElement("div", {
    style: mediaWrapperStyle
  }, React.createElement("iframe", {
    style: iframeStyle,
    src: "https://open.spotify.com/embed/playlist/4Npjy1i9ibChS6uAFNtuZD?utm_source=generator",
    allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
    loading: "lazy"
  }))), // 🖼️ GIF Tile
  React.createElement("div", {
    key: "gif-tile",
    style: cardStyle
  }, React.createElement("h3", {
    style: {
      marginBottom: "10px",
      fontSize: "1.2rem"
    }
  }, "Good ".concat(timeSlot)), React.createElement("div", {
    style: mediaWrapperStyle
  }, React.createElement("img", {
    src: gifUrl,
    alt: timeSlot,
    style: imgStyle,
    onError: function onError(e) {
      e.target.src = "https://via.placeholder.com/350x200?text=GIF+Not+Available";
    }
  })))]);
};

var Movies = function Movies() {
  var getMovies = function getMovies() {
    return [{
      desc: "A tale of some people watching over a large portion of space.",
      id: 1,
      icon: "fa-solid fa-galaxy",
      image: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFydmVsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
      title: "Protectors of the Milky Way"
    }, {
      desc: "Some people leave their holes to disrupt some things.",
      id: 2,
      icon: "fa-solid fa-hat-wizard",
      image: "https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bG9yZCUyMG9mJTIwdGhlJTIwcmluZ3N8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
      title: "Hole People"
    }, {
      desc: "A boy with a dent in his head tries to stop a bad guy. And by bad I mean bad at winning.",
      id: 3,
      icon: "fa-solid fa-broom-ball",
      image: "https://images.unsplash.com/photo-1632266484284-a11d9e3a460a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGhhcnJ5JTIwcG90dGVyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
      title: "Pot of Hair"
    }, {
      desc: "A long drawn out story of some people fighting over some space. Cuz there isn't enough of it.",
      id: 4,
      icon: "fa-solid fa-starship-freighter",
      image: "https://images.unsplash.com/photo-1533613220915-609f661a6fe1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c3RhciUyMHdhcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
      title: "Area Fights"
    }].map(function (movie) {
      var styles = {
        backgroundImage: "url(".concat(movie.image, ")")
      };
      var id = "movie-card-".concat(movie.id);
      return React.createElement("div", {
        key: movie.id,
        id: id,
        className: "movie-card"
      }, React.createElement("div", {
        className: "movie-card-background background-image",
        style: styles
      }), React.createElement("div", {
        className: "movie-card-content"
      }, React.createElement("div", {
        className: "movie-card-info"
      }, React.createElement("span", {
        className: "movie-card-title"
      }, movie.title), React.createElement("span", {
        className: "movie-card-desc"
      }, movie.desc)), React.createElement("i", {
        className: movie.icon
      })));
    });
  };

  return React.createElement(MenuSection, {
    icon: "fa-solid fa-camera-movie",
    id: "movies-section",
    scrollable: true,
    title: "Popcorn time!"
  }, getMovies());
};

var UserStatusButton = function UserStatusButton(props) {
  var _React$useContext2 = React.useContext(AppContext),
      userStatus = _React$useContext2.userStatus,
      setUserStatusTo = _React$useContext2.setUserStatusTo;

  var handleOnClick = function handleOnClick() {
    setUserStatusTo(props.userStatus);
  };

  return React.createElement("button", {
    id: props.id,
    className: "user-status-button clear-button",
    disabled: userStatus === props.userStatus,
    type: "button",
    onClick: handleOnClick
  }, React.createElement("i", {
    className: props.icon
  }));
};

var Menu = function Menu() {
  return React.createElement("div", {
    id: "app-menu"
  }, React.createElement("div", {
    id: "app-menu-content-wrapper"
  }, React.createElement("div", {
    id: "app-menu-content"
  }, React.createElement("div", {
    id: "app-menu-content-header"
  }, React.createElement("div", {
    className: "app-menu-content-header-section"
  }, React.createElement(Info, {
    id: "app-menu-info"
  }), React.createElement(Reminder, null)), React.createElement("div", {
    className: "app-menu-content-header-section"
  }, React.createElement(UserStatusButton, {
    icon: "fa-solid fa-lock fa-2x",
    id: "sign-out-button",
    userStatus: UserStatus.LoggedOut
  }))), React.createElement(QuickNav, null), React.createElement(Weather, null), React.createElement(Restaurants, null), React.createElement(Tools, null), React.createElement(Movies, null))));
};

var Background = function Background() {
  var _React$useContext3 = React.useContext(AppContext),
      userStatus = _React$useContext3.userStatus,
      setUserStatusTo = _React$useContext3.setUserStatusTo;

  var handleOnClick = function handleOnClick() {
    if (userStatus === UserStatus.LoggedOut) {
      setUserStatusTo(UserStatus.LoggingIn);
    }
  };

  return React.createElement("div", {
    id: "app-background",
    onClick: handleOnClick
  }, React.createElement("div", {
    id: "app-background-image",
    className: "background-image"
  }));
};

var Loading = function Loading() {
  return React.createElement("div", {
    id: "app-loading-icon"
  }, React.createElement("i", {
    className: "fa-solid fa-spinner-third"
  }));
};

var AppContext = React.createContext(null);

var App = function App() {
  var _React$useState9 = React.useState(UserStatus.LoggedOut),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      userStatus = _React$useState10[0],
      setUserStatusTo = _React$useState10[1];

  var getStatusClass = function getStatusClass() {
    return userStatus.replace(/\s+/g, "-").toLowerCase();
  };

  return React.createElement(AppContext.Provider, {
    value: {
      userStatus: userStatus,
      setUserStatusTo: setUserStatusTo
    }
  }, React.createElement("div", {
    id: "app",
    className: getStatusClass()
  }, React.createElement(Info, {
    id: "app-info"
  }), React.createElement(Pin, null), React.createElement(Menu, null), React.createElement(Background, null), React.createElement("div", {
    id: "sign-in-button-wrapper"
  }, React.createElement(UserStatusButton, {
    icon: "fa-solid fa-arrow-right-to-arc",
    id: "sign-in-button",
    userStatus: UserStatus.LoggingIn
  })), React.createElement(Loading, null)));
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root")); // 👇 Replace this selector with your actual unlock/dismiss button or event trigger

var lockButton = document.querySelector('#unlock-btn'); // 🔁 your button ID/class

if (lockButton) {
  lockButton.addEventListener('click', function () {
    setTimeout(function () {
      // 👇 Scrolls smoothly to 1200px down the page. Adjust as needed
      window.scrollTo({
        top: 1200,
        behavior: 'smooth'
      });
    }, 400); // small delay for animations/transitions if any
  });
}