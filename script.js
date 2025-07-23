"use strict";
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
    Default["PIN"] = "3782";
})(Default || (Default = {}));


var WeatherType;
(function (WeatherType) {
    WeatherType["Cloudy"] = "Cloudy";
    WeatherType["Rainy"] = "Rainy";
    WeatherType["Stormy"] = "Stormy";
    WeatherType["Sunny"] = "Sunny";
})(WeatherType || (WeatherType = {}));
const defaultPosition = () => ({
    left: 0,
    x: 0
});
const N = {
    clamp: (min, value, max) => Math.min(Math.max(min, value), max),
    rand: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
};
const T = {
    format: (date) => {
        const hours = T.formatHours(date.getHours()), minutes = date.getMinutes(), seconds = date.getSeconds();
        return `${hours}:${T.formatSegment(minutes)}`;
    },
    formatHours: (hours) => {
        return hours % 12 === 0 ? 12 : hours % 12;
    },
    formatSegment: (segment) => {
        return segment < 10 ? `0${segment}` : segment;
    }
};
const LogInUtility = {
    verify: async (pin) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (pin === Default.PIN) {
                    resolve(true);
                }
                else {
                    reject(`Invalid pin: ${pin}`);
                }
            }, N.rand(300, 700));
        });
    }
};
const useCurrentDateEffect = () => {
    const [date, setDate] = React.useState(new Date());
    React.useEffect(() => {
        const interval = setInterval(() => {
            const update = new Date();
            if (update.getSeconds() !== date.getSeconds()) {
                setDate(update);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [date]);
    return date;
};
const ScrollableComponent = (props) => {
    const ref = React.useRef(null);
    const [state, setStateTo] = React.useState({
        grabbing: false,
        position: defaultPosition()
    });
    const handleOnMouseDown = (e) => {
        setStateTo(Object.assign(Object.assign({}, state), { grabbing: true, position: {
                x: e.clientX,
                left: ref.current.scrollLeft
            } }));
    };
    const handleOnMouseMove = (e) => {
        if (state.grabbing) {
            const left = Math.max(0, state.position.left + (state.position.x - e.clientX));
            ref.current.scrollLeft = left;
        }
    };
    const handleOnMouseUp = () => {
        if (state.grabbing) {
            setStateTo(Object.assign(Object.assign({}, state), { grabbing: false }));
        }
    };
    return (React.createElement("div", { ref: ref, className: classNames("scrollable-component", props.className), id: props.id, onMouseDown: handleOnMouseDown, onMouseMove: handleOnMouseMove, onMouseUp: handleOnMouseUp, onMouseLeave: handleOnMouseUp }, props.children));
};
const WeatherSnap = () => {
    const date = useCurrentDateEffect();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[date.getDay()];
    const day = T.formatSegment(date.getDate());
    const month = T.formatSegment(date.getMonth() + 1);
    const year = date.getFullYear();

    return (
        React.createElement("div", {
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
        },
            React.createElement("div", { className: "weather-day" }, dayName),
            React.createElement("div", { className: "weather-date" }, `${month}/${day}/${year}`)
        )
    );
};

const Reminder = () => {
    return (React.createElement("div", { className: "reminder" },
        React.createElement("div", { className: "reminder-icon" },
            React.createElement("i", { className: "" })),
        React.createElement("span", { className: "reminder-text" },
            "Decisions are the keys to the future. ",
            React.createElement("span", { className: "reminder-time" }, ""))));
};
const Time = () => {
    const date = useCurrentDateEffect();
    return (React.createElement("span", { className: "time" }, T.format(date)));
};
const Info = (props) => {
    return (React.createElement("div", { id: props.id, className: "info" },
        React.createElement(Time, null),
        React.createElement(WeatherSnap, null)));
};
const PinDigit = (props) => {
    const [hidden, setHiddenTo] = React.useState(false);
    React.useEffect(() => {
        if (props.value) {
            const timeout = setTimeout(() => {
                setHiddenTo(true);
            }, 500);
            return () => {
                setHiddenTo(false);
                clearTimeout(timeout);
            };
        }
    }, [props.value]);
    return (React.createElement("div", { className: classNames("app-pin-digit", { focused: props.focused, hidden }) },
        React.createElement("span", { className: "app-pin-digit-value" }, props.value || "*")));
};
const Pin = () => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const [pin, setPinTo] = React.useState("");
    const ref = React.useRef(null);
    React.useEffect(() => {
        if (userStatus === UserStatus.LoggingIn || userStatus === UserStatus.LogInError) {
            ref.current.focus();
        }
        else {
            setPinTo("");
        }
    }, [userStatus]);
    React.useEffect(() => {
        if (pin.length === 4) {
            const verify = async () => {
                try {
                    setUserStatusTo(UserStatus.VerifyingLogIn);
                    if (await LogInUtility.verify(pin)) {
                        setUserStatusTo(UserStatus.LoggedIn);
                    }
                }
                catch (err) {
                    console.error(err);
                    setUserStatusTo(UserStatus.LogInError);
                }
            };
            verify();
        }
        if (userStatus === UserStatus.LogInError) {
            setUserStatusTo(UserStatus.LoggingIn);
        }
    }, [pin]);
    const handleOnClick = () => {
        ref.current.focus();
    };
    const handleOnCancel = () => {
        setUserStatusTo(UserStatus.LoggedOut);
    };
    const handleOnChange = (e) => {
        if (e.target.value.length <= 4) {
            setPinTo(e.target.value.toString());
        }
    };
    const getCancelText = () => {
        React.useEffect(() => {
            const handleKeyDown = (e) => {
                if (e.key === "Escape") {
                    handleOnCancel();
                }
                if (e.key === " " || e.key === "Spacebar") {
                    if (ref.current && (userStatus === UserStatus.LoggedOut)) {
                        setUserStatusTo(UserStatus.LoggingIn);
                        ref.current.focus();
                    }
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }, [userStatus]);
        return (React.createElement("span", { id: "app-pin-cancel-text", onClick: handleOnCancel }, "| Cancel"));
    };
    const getErrorText = () => {
        if (userStatus === UserStatus.LogInError) {
            return (React.createElement("span", { id: "app-pin-error-text" }, " Invalid"));
        }
    };
    return (React.createElement("div", { id: "app-pin-wrapper" },
        React.createElement("input", { disabled: userStatus !== UserStatus.LoggingIn && userStatus !== UserStatus.LogInError, id: "app-pin-hidden-input", maxLength: 4, ref: ref, type: "number", value: pin, onChange: handleOnChange }),
        React.createElement("div", { id: "app-pin", onClick: handleOnClick },
            React.createElement(PinDigit, { focused: pin.length === 0, value: pin[0] }),
            React.createElement(PinDigit, { focused: pin.length === 1, value: pin[1] }),
            React.createElement(PinDigit, { focused: pin.length === 2, value: pin[2] }),
            React.createElement(PinDigit, { focused: pin.length === 3, value: pin[3] })),
        React.createElement("h3", { id: "app-pin-label" },
            "Enter PIN",
            getErrorText(),
            " ",
            getCancelText())));
};
const MenuSection = (props) => {
    const getContent = () => {
        if (props.scrollable) {
            return (React.createElement(ScrollableComponent, { className: "menu-section-content" }, props.children));
        }
        return (React.createElement("div", { className: "menu-section-content" }, props.children));
    };
    return (React.createElement("div", { id: props.id, className: "menu-section" },
        React.createElement("div", { className: "menu-section-title" },
            React.createElement("i", { className: props.icon }),
            React.createElement("span", { className: "menu-section-title-text" }, props.title)),
        getContent()));
};


const QuickNav = () => {
    const getItems = () => {
        const items = [
            {
                id: 1,
                label: "| ChatGpt",
                href: "https://chat.openai.com/",
                icon: "https://chat.openai.com/favicon.ico",
            },
            {
                id: 2,
                label: "| Gemini",
                href: "https://gemini.google.com/",
                icon: "https://registry.npmmirror.com/@lobehub/icons-static-png/1.56.0/files/dark/gemini-color.png",
            },
            {
                id: 3,
                label: "| Perplexity",
                href: "https://www.perplexity.ai/",
                icon: "https://www.perplexity.ai/favicon.ico"
            },
            {
                id: 4,
                label: "| DeepSeek",
                href: "https://chat.deepseek.com/",
                icon: "https://www.deepseek.com/favicon.ico"
            },
            {
                id: 5,
                label: "| WhatsApp",
                href: "https://web.whatsapp.com/",
                icon: "whatsapp.png"
            },

            {
                id: 6,
                label: "| GitHub",
                href: "https://github.com/suryarajamandapalli",
                icon: "https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg"
            },

                        {
                id: 7,
                label: "| YouTube",
                href: "https://www.youtube.com/",
                icon: "https://www.youtube.com/s/desktop/493698c2/img/logos/favicon_144x144.png"
            },

            {
                id: 8,
                label: "| Gmail",
                href: "https://mail.google.com/mail/?tab=rm&ogbl",
                icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
            }

        ];

        return items.map((item) =>
            React.createElement("a", {
                key: item.id,
                className: "quick-nav-item clear-button",
                href: item.href,
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: "4px 0",
                    transition: "background-color 0.4s ease",
                }
            },
                React.createElement("img", {
                    src: item.icon,
                    alt:`${item.label}icon`,
                    style: {
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px"
                    }
                }),
                React.createElement("span", { className: "quick-nav-item-label" }, item.label)
            )
        );
    };

    return React.createElement(ScrollableComponent, { id: "quick-nav" }, getItems());
};



const Weather = () => {
    const getDays = () => {
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
            }].map((day) => {
            const getIcon = () => {
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
            return (React.createElement("div", { key: day.id, className: "day-card" },
                React.createElement("div", { className: "day-card-content" },
                    React.createElement("span", { className: "day-weather-temperature" },
                        day.temperature,
                        React.createElement("span", { className: "day-weather-temperature-unit" }, "\u00B0F")),
                    React.createElement("i", { className: classNames("day-weather-icon", getIcon(), day.weather.toLowerCase()) }),
                    React.createElement("span", { className: "day-name" }, day.name))));
        });
    };
    return (React.createElement(MenuSection, { icon: "", id: "weather-section", scrollable: true, title: "", style: { display: 'none' } }, getDays()));
};
const Tools = () => {
    const getTools = () => {
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
            }].map((tool) => {
            const styles = {
                backgroundImage: `url(${tool.image})`
            };
            return (React.createElement("div", { key: tool.id, className: "tool-card" },
                React.createElement("div", { className: "tool-card-background background-image", style: styles }),
                React.createElement("div", { className: "tool-card-content" },
                    React.createElement("div", { className: "tool-card-content-header" },
                        React.createElement("span", { className: "tool-card-label" }, tool.label),
                        React.createElement("span", { className: "tool-card-name" }, tool.name)),
                    React.createElement("i", { className: classNames(tool.icon, "tool-card-icon") }))));
        });
    };
    return (React.createElement(MenuSection, { icon: "", id: "tools-section", title: "Quick Navigation" }, getTools()));
};

const Restaurants = () => {
    const getTimeSlot = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 8) return "Early Morning";
        if (hour >= 8 && hour < 12) return "Morning";
        if (hour >= 12 && hour < 17) return "Afternoon";
        if (hour >= 17 && hour < 20) return "Evening";
        return "Night";
    };

    const getRandomGif = (slot) => {
        const gifs = {
            "Early Morning": [
                "https://media.tenor.com/JtSRclSkblsAAAAC/good-morning-sunrise.gif",
                "https://media.tenor.com/qNz64tMyv8IAAAAC/morning-rise-and-shine.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2FsY28zcnhpNDgzbGZtbHAwMHN1dG5yZ3kxbmRlNnk5YTFoM3VlMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KxbhQdZQ8Pvo47Hnti/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzJmdW8wdGxrbjIxOXoyY2FzOW4ycTUydjI4YXBrcnR3cHJodXhoYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/13DobtLzCTj16M/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzJmdW8wdGxrbjIxOXoyY2FzOW4ycTUydjI4YXBrcnR3cHJodXhoYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/AsAvSi7jJzbVfDnrpJ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGVkZWp2ZnI5ZjBidXk2eG9tdnhoMzdqN2twNzhqbGYzdDRteDhpeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WzLDljBpplUvm/giphy.gif",
                "https://media1.tenor.com/m/GjhrClBv4WwAAAAd/nature-rain.gif",
                "https://media1.tenor.com/m/PIW2WxL6iNAAAAAd/aesthetic-anime.gif",
                "https://media1.tenor.com/m/eawU1m28QAYAAAAd/garden-of-words-anime.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDBtYmFvZjl6ejRzYjM0ODlsMG1vZGd5Y2JheG9wMDdiNGM2MzR4ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xeP1oX0sSlD0D4s/giphy.gif",
                "https://tenor.com/Twp6MiCp6A.gif",
                "https://tenor.com/bTUbM.gif",
                
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1fnu914Z79qQpVi2xZ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xRioxTFsS7LZWxrC5u/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2HuVpmuQhK3nu2vfz/giphy.gif",
                "https://tenor.com/dSyvSP4cdHC.gif",
                "https://tenor.com/bg4kZ.gif",
                "https://tenor.com/bTu3b.gif",
                "https://tenor.com/mPfNKknJfd2.gif",
                "https://tenor.com/bkNqF.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35EHbc0PtTJGh3uOoA/giphy.gif",
                "https://tenor.com/bIAex.gif",
                "https://tenor.com/bpcfm.gif",
                "https://tenor.com/bVFib.gif",
                "https://tenor.com/cpJw6JgTKB6.gif",
                "https://tenor.com/qcfJOS2T3Ip.gif",
                "https://tenor.com/9VZ2.gif",


            ],
            "Morning": [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnVkazh6YXJ1MjM4dGlhbnR6ZTFnN2xzNGk4eDg4OGZpY2VtbHdxayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PspWBxW4y3Kfu/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnVkazh6YXJ1MjM4dGlhbnR6ZTFnN2xzNGk4eDg4OGZpY2VtbHdxayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xUPGcdJW7q4UDo90je/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczI2YTdrNTE2cnhiM3F4MDJwdXo2NjRhYWVlcTY3MHZvMm9jN2N3cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczI2YTdrNTE2cnhiM3F4MDJwdXo2NjRhYWVlcTY3MHZvMm9jN2N3cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Mgq7EMQUrhcvC/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bXJzY2ltam4zdzVlajZtNGk0MzMzMnJ0dGgxYTJmZjcyc2N3ZmZhbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BAD9hUGYZkqPe/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://tenor.com/jlaleuTnwIF.gif",
                "https://tenor.com/o1DCI49PTxj.gif",


                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1fnu914Z79qQpVi2xZ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xRioxTFsS7LZWxrC5u/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2HuVpmuQhK3nu2vfz/giphy.gif",
                "https://tenor.com/dSyvSP4cdHC.gif",
                "https://tenor.com/bg4kZ.gif",
                "https://tenor.com/bTu3b.gif",
                "https://tenor.com/mPfNKknJfd2.gif",
                "https://tenor.com/bkNqF.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35EHbc0PtTJGh3uOoA/giphy.gif",
                "https://tenor.com/bIAex.gif",
                "https://tenor.com/bpcfm.gif",
                "https://tenor.com/bVFib.gif",
                "https://tenor.com/cpJw6JgTKB6.gif",
                "https://tenor.com/qcfJOS2T3Ip.gif",
                "https://tenor.com/9VZ2.gif",
                "https://tenor.com/r57nHbIg7dv.gif",





                "https://media1.tenor.com/m/YCc_7AEWPhwAAAAd/nature-background-anime-nature-aesthetic.gif",
                "https://media1.tenor.com/m/satC_iXTpfYAAAAd/kikis-delivery-service-nature.gif",
                "https://media1.tenor.com/m/DtlRW-ln4-4AAAAd/moon-water.gif",
                "https://media1.tenor.com/m/HB6Ku4skoP8AAAAd/anime-goodnight.gif",
                "https://media1.tenor.com/m/jZ4lkZjRKNcAAAAd/anime-nature.gif",
                "https://media1.tenor.com/m/2SPaMvRXcZcAAAAd/anime-another.gif",
                "https://media1.tenor.com/m/iuBOwuUcFukAAAAd/autumn-fall.gif",
                "https://media1.tenor.com/m/NKIIuz2_FMAAAAAd/rain-green.gif",
                "https://media1.tenor.com/m/eawU1m28QAYAAAAd/garden-of-words-anime.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHlndmRqcWdpbGhzNThrbnFhN3V1cHVybWtrNWRieTkyMHluZmp2aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/IuVFGSQZTd6TK/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDBjY2tkbnY2b2F2d2x5dXllaGN6YXV0YjU5aHh5ODRyd2djOXBjdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jlvE2SvCa8ryIpb97I/giphy.gif",
                "https://tenor.com/v8GIjYtV6Jh.gif",
                "https://tenor.com/kO59H5ABig4.gif",
                "https://tenor.com/pyuNKiDvXm4.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjFqcHBuc2d5MjQza2Q4bXRmZnBlbDNxejViZTQzbW50cGU2MG82aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5nvK9hUOcK3KAvkMgH/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NGFoanF6dHRwN2JjZjkxbDQxM21naXFzb3czaG1oZGV2OGJuMDFubyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/2J5uH3CSBheLlEuCVc/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OWYwdGdhb3k5OHVweXU1OHZucXU1ejUwam5pNnAwem82MWpxOGhiZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yvdeiIIZL0I6uMgipJ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MXU5dTUzamVkbnE4OWs0cGl1azJwbzZpNndqMG1lajIzdjZ1ZTU2YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/CK7jeVJ8q0NS1oLdm4/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MXU5dTUzamVkbnE4OWs0cGl1azJwbzZpNndqMG1lajIzdjZ1ZTU2YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KebICSbjk18COavsKA/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eGphZGZ3YXg4cmtzYjdlMzNwZDJsMW14bnhrNHRyOWIwZzF3eWwwbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5rI56FGk3HTaBTkePi/giphy.gif",
                "https://tenor.com/bUpEX.gif",
                "https://tenor.com/btpRP.gif",
                "https://tenor.com/bPJxj.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3pybGNtZ3NoYWFuNHZseHYxNnBwa29samZjbDJ6bWQ1bGZybHc4NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/13DobtLzCTj16M/giphy.gif"
                



            ],
            "Afternoon": [
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHhjMjgybjQzbGg3ZmpmaXc2MWJtcDg3cTFldGE5d2p4YW03NHRlcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0wlvGLHmojbeu5vq/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZubHR5czFvMjdydWU2aDFpN2M2ZGt4ejV0Y3F2M3ZnNzI2emh0diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/hrJj4LarGeUCs/giphy.webp",
                "https://media1.tenor.com/m/eawU1m28QAYAAAAd/garden-of-words-anime.gif",


                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1fnu914Z79qQpVi2xZ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xRioxTFsS7LZWxrC5u/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2HuVpmuQhK3nu2vfz/giphy.gif",
                "https://tenor.com/dSyvSP4cdHC.gif",
                "https://tenor.com/bg4kZ.gif",
                "https://tenor.com/bTu3b.gif",
                "https://tenor.com/mPfNKknJfd2.gif",
                "https://tenor.com/bkNqF.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35EHbc0PtTJGh3uOoA/giphy.gif",
                "https://tenor.com/bIAex.gif",
                "https://tenor.com/bpcfm.gif",
                "https://tenor.com/bVFib.gif",
                "https://tenor.com/cpJw6JgTKB6.gif",
                "https://tenor.com/qcfJOS2T3Ip.gif",
                "https://tenor.com/9VZ2.gif",

                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejc1YTU4cWNud2NqdDIxY2ppeWluODRodzkyNTJxOWNzNXF6Nmt4eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fEokfUFbNif3QUGkJE/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTYxdnJ3MTVyYWlybGw0cHdlNDlud2NxYXRiMGI0aTJva2poOWxpZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1ncq2XAnrLN2d90Q3C/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MWs5OTBzMG1va3k2bTF4c3BzM2lybHgzMDhtaHB5aGVnNzcwbzMyeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uOuiK4F5zZkZ2/giphy.gif",
                "https://tenor.com/cc0FDuYzcoA.gif",

                

            ],
            "Evening": [
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExajdhaWg1MDRqbGVlMTdmbWw4cTR5d2Z0NHlwOHA1MTY4eHZ5czRhaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/B2czf5h7JtjNe/giphy.webp",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXN1ZjN4OHV1am5qeXM5a3g4ZWdtYnZsdWc0ZDM2dnBnN3hlcHgxZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Mgq7EMQUrhcvC/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTllcGE3OXVoZWxvdGpsNHUwNmJzeGJwcGNjaW1jcTAxMTV2bnRzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wK2MKn5jjcvUIe2ux1/giphy.gif",
                "https://i.giphy.com/1hujy3a24Q3eM.webp",
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXY2cG9wNHlvemR2bHNteGVnamU1ZDB5c3pqcGR1b2dqaTQ5ZXEydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5cYAQwngz7JRN0fab6/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXQ1cTI5NGNjYzdpdnd1d3M4c3FvMWd3bmk2bDRraXlzcmQ2dHVybCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/49VB0PHxR5Vsc/giphy.webp",
                "https://i.giphy.com/iP8UJhdQnWKibKUO3U.webp",
                "https://cdn.pixabay.com/animation/2023/01/25/00/36/00-36-10-183_512.gif",
                "https://media1.tenor.com/m/eawU1m28QAYAAAAd/garden-of-words-anime.gif",


                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1fnu914Z79qQpVi2xZ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xRioxTFsS7LZWxrC5u/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2HuVpmuQhK3nu2vfz/giphy.gif",
                "https://tenor.com/dSyvSP4cdHC.gif",
                "https://tenor.com/bg4kZ.gif",
                "https://tenor.com/bTu3b.gif",
                "https://tenor.com/mPfNKknJfd2.gif",
                "https://tenor.com/bkNqF.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35EHbc0PtTJGh3uOoA/giphy.gif",
                "https://tenor.com/bIAex.gif",
                "https://tenor.com/bpcfm.gif",
                "https://tenor.com/bVFib.gif",
                "https://tenor.com/cpJw6JgTKB6.gif",
                "https://tenor.com/qcfJOS2T3Ip.gif",
                "https://tenor.com/9VZ2.gif",

                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXEwZ2llNjUzdGsyM2tmdnRkenRhN3NicW9sOWNraDlyaGEzZ3lsYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1J9BYe5eZccC4Nck/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzM4czY4dmQzMjBxYzNtcDQ2eHVoMTd2ZjJicW8xdGd5aDBjaWVmcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wK2MKn5jjcvUIe2ux1/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzM4czY4dmQzMjBxYzNtcDQ2eHVoMTd2ZjJicW8xdGd5aDBjaWVmcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1Qi7GG8my6uhLHPLP5/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZjA1NHk2ZWVib3BzaGdwdmI4ZTBkd3poOXZtYTQyaTBxNDltNmViMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aD9y2CKtGHRfhOE/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZjA1NHk2ZWVib3BzaGdwdmI4ZTBkd3poOXZtYTQyaTBxNDltNmViMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT9KVgHIvt5YJXT7W0/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NDNlbmg3ZjQxdDRyYzBmejhsNXdwOWp0N3duNnN3MmI0bmx6cHBidSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fSYEBNTtPJ7YbjRXX4/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NDNlbmg3ZjQxdDRyYzBmejhsNXdwOWp0N3duNnN3MmI0bmx6cHBidSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/VbKLOdvCxBFNZpYvhL/giphy.gif",
                "https://tenor.com/cJenZQGlLlb.gif",
                "https://tenor.com/o0DguNIAzOw.gif",
                "https://tenor.com/flnyH8fjLs0.gif",
                "https://tenor.com/fFBzgygd0px.gif",
                "https://tenor.com/bzPv0.gif",
                "https://tenor.com/o1KqEo65DMk.gif",
                "https://tenor.com/bwOux.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXoxcDE1c3M4eDZqcTBuN25xdXV6dXVvazV3cmczZ3RjOWs0M3lwOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/A5ffIYwJoEpVcMOYiO/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXoxcDE1c3M4eDZqcTBuN25xdXV6dXVvazV3cmczZ3RjOWs0M3lwOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OQGQhQwdGQ5dQzOb8h/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cGd1cjJ2NTg2ZGhsZzUwbWhsazh4NWk3em1sa3h1eDZrYTVua3BoNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lerDGzJj9UpkfnNFrc/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2QxeWZ6NHdqOGJ4ZG05emtsZWgwMndhd3d6M3RsYjFsY3Npb2U2MiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3u1ddaqmS8VL2aAJ31/giphy.gif",


            ],
            "Night": [
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXVteWVlaWh6cHoxenptZW9uZjZ0YmF2NWQybHV1M2l5dzcyM3JwcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Zf7L4QMWo3RkI/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXVteWVlaWh6cHoxenptZW9uZjZ0YmF2NWQybHV1M2l5dzcyM3JwcSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l5JbspfwZ0yjHjlJ0K/giphy.gif",
                "https://media1.tenor.com/m/mHIyos8O8McAAAAd/drapes-purple.gif",
                "https://media1.tenor.com/m/3e5xTKIkoJYAAAAd/aesthetic-anime.gif",
                "https://media1.tenor.com/m/lX7BjRlqi8MAAAAd/lofi.gif",
                "https://media1.tenor.com/m/rDWAbi_iMRwAAAAd/moon-anime.gif",
                "https://media1.tenor.com/m/eawU1m28QAYAAAAd/garden-of-words-anime.gif",
                "https://tenor.com/bNDUV.gif",
                "https://tenor.com/bxjGW.gif",
                "https://tenor.com/1x3o.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM25ydnhld2tyc3BycTcyMDJ5Mm9jODV6cWZ0dnpubGV6d3g1bXAzNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Zf7L4QMWo3RkI/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWE4cmVtZXR6aGRraHZsaWx0djkzdHN6M2F4eXpvZ293ZXJyNHdiYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/b29IZK1dP4aWs/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWE4cmVtZXR6aGRraHZsaWx0djkzdHN6M2F4eXpvZ293ZXJyNHdiYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3gTmgzy7wYJfyaGRHQ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTl4dDE2cjN2Zmxka2RiMXZ5cXVlbTd0Y3djMXhhdDFiYmdqaHFteSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Id71NFYfSBOKv2IexE/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZWQ4cmkxN2hya2xxbWMxZWRmbzF1c3pqdGV2c2puanN2MGpxODR0cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NsjutwzYUp12YP6mbh/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y3JkNWk1dnJ4a2tobG4ybmllM3dpM2l2aGpheHB4eG5iOWVkMzZ0aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Fzt6LL05lletW/giphy.gif",
                "https://tenor.com/bURrj.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG1hN2JodHV6Z2RtZDVlYjRqZzk3MDJoMmEwaWdjYThmYnQwOWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wjjvv8CEWSdAcdlgtP/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG1hN2JodHV6Z2RtZDVlYjRqZzk3MDJoMmEwaWdjYThmYnQwOWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/E8GfFH47PKeyI/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDI3dzdzbXQxbnNvcnE0cTYycGI4YTdkYnUzeTRxamlpOTR2YXc3dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mjTpgz6FGNVDoMg5lx/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDI3dzdzbXQxbnNvcnE0cTYycGI4YTdkYnUzeTRxamlpOTR2YXc3dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/j3mdQpQ9SKxFOWs9gy/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDI3dzdzbXQxbnNvcnE0cTYycGI4YTdkYnUzeTRxamlpOTR2YXc3dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Wm9XlKG2xIMiVcH4CP/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDI3dzdzbXQxbnNvcnE0cTYycGI4YTdkYnUzeTRxamlpOTR2YXc3dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/AFZiEftZJS6qLsyODL/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmppZ3F5aWs1dnQ4aXpkNXg2bXp1aHdwcDczdHhscGc1eTNzems5byZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/UT5C4hCvmlSzJ7QeQy/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmppZ3F5aWs1dnQ4aXpkNXg2bXp1aHdwcDczdHhscGc1eTNzems5byZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fVsVfxVwz40I24GT7X/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bmppZ3F5aWs1dnQ4aXpkNXg2bXp1aHdwcDczdHhscGc1eTNzems5byZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/WoR3wMdCAHd2r8y19d/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Zzg4cjJuZjc3aWNtMnU0dHhja2JtenF2ZTU4dmRrMWNtanM5N2NzcSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/hSpRpdP46ETIXXWajD/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Zzg4cjJuZjc3aWNtMnU0dHhja2JtenF2ZTU4dmRrMWNtanM5N2NzcSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/UVHCnps6XrLm2vLDHq/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bGJ2cmN4N3ByNTV6OHRqdHc0aTFmN2UyNGg2Y3I2bWR5OTl0aHd4aSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/jRfJxezP5Jt2uiZaK0/giphy.gif0",





                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzcwOGd6cGFqYmhxYWxrdnF3NTg5dHhhejVlaXhibXE2cjJpa3NlYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8VEpd4oZjDq5a/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1fnu914Z79qQpVi2xZ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xRioxTFsS7LZWxrC5u/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRxYmEzcGxmaHBxc2RtZDFkbXZ5MWcxM25hZGRoMWlwdXkyYjF1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2HuVpmuQhK3nu2vfz/giphy.gif",
                "https://tenor.com/dSyvSP4cdHC.gif",
                "https://tenor.com/bg4kZ.gif",
                "https://tenor.com/bTu3b.gif",
                "https://tenor.com/mPfNKknJfd2.gif",
                "https://tenor.com/bkNqF.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t7Qb8655Z1VfBGr5XB/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3FsbWN0MXU2YnpyYWdvbjdyZTExOXA0YjF2M2NocG9tdHBicGh5bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35EHbc0PtTJGh3uOoA/giphy.gif",
                "https://tenor.com/bIAex.gif",
                "https://tenor.com/bpcfm.gif",
                "https://tenor.com/bVFib.gif",
                "https://tenor.com/cpJw6JgTKB6.gif",
                "https://tenor.com/qcfJOS2T3Ip.gif",
                "https://tenor.com/9VZ2.gif",

            ]
        };

        const available = gifs[slot] || [];
        return available[Math.floor(Math.random() * available.length)];
    };

    const timeSlot = getTimeSlot();
    const [gifUrl, setGifUrl] = React.useState(getRandomGif(timeSlot));
    const [spotifySrc, setSpotifySrc] = React.useState("https://open.spotify.com/embed/playlist/4Npjy1i9ibChS6uAFNtuZD?utm_source=generator");
    const [hovering, setHovering] = React.useState(false);

    const spotifyPlaylists = [
        "https://open.spotify.com/embed/playlist/4Npjy1i9ibChS6uAFNtuZD",
        "https://open.spotify.com/embed/playlist/37i9dQZF1DX0SM0LYsmbMT",
        "https://open.spotify.com/embed/playlist/37i9dQZF1DWU0ScTcjJBdj",
        "https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8?"
        
        
    ];

    const shuffleSpotify = () => {
        const next = spotifyPlaylists[Math.floor(Math.random() * spotifyPlaylists.length)];
        setSpotifySrc(next + "?utm_source=generator");
    };

    const containerStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
        padding: "20px"
    };

    const cardStyle = {
        height: "95%",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1),
            inset 0 0 0px 0px rgba(255, 255, 255, 0),
            0 8px 16px rgba(0, 0, 0, 0.5)
        `,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        cursor: "pointer"
    };

    const mediaWrapperStyle = {
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)"
    };

    const iframeStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "12px"
    };

    const imgStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "12px"
    };

    const diceStyle = {
        position: "absolute",
        top: "-8px",
        left: "-8px",
        background: "rgba(0,0,0,0.7)",
        padding: "6px 10px",
        fontSize: "16px",
        borderRadius: "8px",
        zIndex: 1,
        cursor: "pointer",
        opacity: hovering ? 1 : 0,
        transition: "opacity 0.3s"
    };

    const refreshGif = () => {
        setGifUrl(getRandomGif(timeSlot));
    };

    return React.createElement("div", { style: containerStyle }, [

        // 🎵 Spotify Tile with Dice
        React.createElement("div", {
            key: "spotify-tile",
            style: cardStyle,
            onMouseEnter: () => setHovering(true),
            onMouseLeave: () => setHovering(false)
        }, [
            React.createElement("div", {
                style: diceStyle,
                onClick: (e) => {
                    e.stopPropagation();
                    shuffleSpotify();
                }
            }, "🎲"),
            React.createElement("div", { style: mediaWrapperStyle },
                React.createElement("iframe", {
                    style: iframeStyle,
                    src: spotifySrc,
                    allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
                    loading: "lazy"
                })
            )
        ]),

        // 🖼️ GIF Tile
        React.createElement("div", {
            key: "gif-tile",
            style: cardStyle,
            onClick: refreshGif
        },
            React.createElement("div", { style: mediaWrapperStyle },
                React.createElement("img", {
                    src: gifUrl,
                    alt: timeSlot,
                    style: imgStyle,
                    onError: (e) => {
                        e.target.src = "https://via.placeholder.com/350x200?text=GIF+Not+Available";
                    }
                })
            )
        )
    ]);
};



const Movies = () => {
    const getMovies = () => {
        return [{
            id: 1,
            title: "GATE 2025 Syllabus",
            icon: "fa-solid fa-galaxy",
            pdf: "https://gate2025.iitr.ac.in/doc/2025/GATE%20_CS_2025_Syllabus.pdf"
        }, {
            id: 2,
            title: "2-1 JNTUK R23 Syllabus",
            icon: "fa-solid fa-hat-wizard",
            pdf: "file:///C:/Users/surya/Downloads/R23-II-Year-Syllabus-CSE.pdf"
        }, {
            id: 3,
            title: "People",
            icon: "fa-solid fa-hat-wizard",
            pdf: "file:///C:/Users/surya/Downloads/R23-II-Year-Syllabus-CSE.pdf"
        }].map((movie) => {
            const id = `movie-card-${movie.id}`;

            const pdfTile = React.createElement("div", {
                key: id,
                id,
                style: {
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
                    marginBottom: "8px",
                }
            },
                React.createElement("iframe", {
                    src: `${movie.pdf}#toolbar=0`,
                    width: "100%",
                    height: "600px",
                    style: {
                        border: "1px solid #ccc",
                        overflow: "auto"
                    },
                    title: movie.title
                }),
                React.createElement("button", {
                    onClick: (e) => {
                        e.stopPropagation();
                        window.open(movie.pdf, "_self");
                    },
                    style: {
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        border: "none",
                        padding: "8px",
                        borderRadius: "50%",
                        fontSize: "16px",
                        cursor: "pointer",
                        zIndex: 2
                    },
                    title: "Open fullscreen"
                },
                    React.createElement("i", { className: "fa-solid fa-up-right-and-down-left-from-center" })
                )
            );

            const titleBar = React.createElement("div", {
                style: {
                    textAlign: "left",
                    marginTop: "6px",
                    padding: "4px",
                    fontSize: "15px",
                    color: "#fff",
                    fontFamily: "Rubik, sans-serif"
                }
            }, movie.title);

            return React.createElement("div", {
                style: {
                    width: "100%",
                    marginBottom: "30px"
                }
            }, pdfTile, titleBar);
        });
    };

    return React.createElement(MenuSection, {
        icon: "fa-solid fa-camera-movie",
        id: "movies-section",
        scrollable: true,
        title: "Docs"
    }, getMovies());
};





const UserStatusButton = (props) => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const handleOnClick = () => {
        setUserStatusTo(props.userStatus);
    };
    return (React.createElement("button", { id: props.id, className: "user-status-button clear-button", disabled: userStatus === props.userStatus, type: "button", onClick: handleOnClick },
        React.createElement("i", { className: props.icon })));
};
const Menu = () => {
    return (React.createElement("div", { id: "app-menu" },
        React.createElement("div", { id: "app-menu-content-wrapper" },
            React.createElement("div", { id: "app-menu-content" },
                React.createElement("div", { id: "app-menu-content-header" },
                    React.createElement("div", { className: "app-menu-content-header-section" },
                        React.createElement(Info, { id: "app-menu-info" }),
                        React.createElement(Reminder, null)),
                    React.createElement("div", { className: "app-menu-content-header-section" },
                        React.createElement(UserStatusButton, { icon: "fa-solid fa-lock fa-2x", id: "sign-out-button", userStatus: UserStatus.LoggedOut }))),
                React.createElement(QuickNav, null),
                React.createElement(Weather, null),
                React.createElement(Restaurants, null),
                React.createElement(Tools, null),
                React.createElement(Movies, null)))));
};



const Background = () => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const handleOnClick = () => {
        if (userStatus === UserStatus.LoggedOut) {
            setUserStatusTo(UserStatus.LoggingIn);
        }
    };
    return (React.createElement("div", { id: "app-background", onClick: handleOnClick },
        React.createElement("div", { id: "app-background-image", className: "background-image" })));
};
const Loading = () => {
    return (React.createElement("div", { id: "app-loading-icon" },
        React.createElement("i", { className: "fa-solid fa-spinner-third" })));
};
const AppContext = React.createContext(null);
const App = () => {
    const [userStatus, setUserStatusTo] = React.useState(UserStatus.LoggedOut);
    const getStatusClass = () => {
        return userStatus.replace(/\s+/g, "-").toLowerCase();
    };
    return (React.createElement(AppContext.Provider, { value: { userStatus, setUserStatusTo } },
        React.createElement("div", { id: "app", className: getStatusClass() },
            React.createElement(Info, { id: "app-info" }),
            React.createElement(Pin, null),
            React.createElement(Menu, null),
            React.createElement(Background, null),
            React.createElement("div", { id: "sign-in-button-wrapper" },
                React.createElement(UserStatusButton, { icon: "fa-solid fa-arrow-right-to-arc", id: "sign-in-button", userStatus: UserStatus.LoggingIn })),
            React.createElement(Loading, null))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById("root"));



