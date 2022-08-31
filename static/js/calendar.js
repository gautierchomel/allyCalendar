import getNavigatorLanguage from "./modules/helpers.js";
import moment from "moment/min/moment-with-locales";
import momentz from "moment-timezone";

// define a new timezone and lang
let localDate = momentz.tz.guess();
let lang = getNavigatorLanguage();
moment.locale(lang);

// build the first calendar
function build() {
  document.querySelectorAll(".event:not(.show) a.acc").forEach((link) => {
    link.href = link.href.replace("events/", "calendar.html#event-");
  });
  if (document.querySelector("#timezoneSelect")) {
    document.querySelector("#timezoneSelect").removeAttribute("disabled");
    document
      .querySelector("#timezoneSelect")
      .querySelectorAll("option")
      .forEach((zn) => {
        zn.removeAttribute("selected");
        if (zn.value == localDate) {
          zn.setAttribute("selected", "selected");
        }
      });
  }
  if (document.querySelector("#search")) {
    document.querySelector("#search").removeAttribute("disabled");
  }
  updateCalendar(momentz.tz.guess(), lang);
}

window.onload = build();

// show hide event by clicking on it
document.querySelectorAll(".event:not(.show) a.acc").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault;
    showEvent(link);
    updateHash(link);
  });
});

// show hide event on search

let showAll;
let showEventToggle;

// show all events in the calendar
function showAllEvents() {
  document.querySelectorAll(`.event`).forEach((e) => {
    e.style.display = "block";
  });
  //TODO: better use a css variable here
  document.querySelectorAll(`#categories li`).forEach((t) => {
    t.style.opacity = "1";
  });
}

// show only events within the categories
function showOnlyEvents(event) {
  if (showAll == false && event == showEventToggle) {
    document.querySelectorAll(`.event`).forEach((e) => {
      e.classList.remove("hide");
    });
    document.querySelectorAll(`#categories li`).forEach((t) => {
      t.style.opacity = "1";
    });
    // showAllEvents();
    showAll = true;
    showEventToggle = "";
  } else {
    document.querySelectorAll(`.event`).forEach((e) => {
      if (e.classList.contains(`event-${event}`)) {
        e.classList.remove("hide");
      } else {
        e.classList.add("hide");
      }
      document.querySelectorAll(`#categories li`).forEach((t) => {
        if (t.dataset.cat == event) {
          t.style.opacity = "1";
        } else {
          t.style.opacity = ".3";
        }
      });
      document.querySelectorAll(`.event-${event}`).forEach((e) => {
        e.classList.remove("hide");
      });
      showEventToggle = event;
      showAll = false;
    });
  }
}

// click on a category icon to show only event part of that a category

document.querySelectorAll("#categories li").forEach((category) => {
  category.addEventListener("click", () => {
    showOnlyEvents(category.dataset.cat);
  });
});

// close event on ESCAPE

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && document.querySelector(".event.show")) {
    document.querySelector(".event.show").classList.remove("show");
  }
});

// close button

document.querySelectorAll(".close").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".event").classList.remove("show");
  });
});

// search
if (document.querySelector("input#search")) {
  document.querySelector("input#search").addEventListener("keyup", function () {
    searchAnEvent(this);
  });
}

function searchAnEvent(input) {
  // const input = document.querySelector('#search');
  let filter = input.value.toUpperCase();
  let eventList = document
    .querySelector("#calendar")
    .querySelectorAll(".event");

  // Loop through all list items, and hide those who don't match the search query
  eventList.forEach((event) => {
    let txtValue =
      event.textContent.toUpperCase() || event.innerText.toUpperCase();
    if (txtValue.indexOf(filter) > -1) {
      event.style.display = "";
    } else {
      event.style.display = "none";
    }
  });
}

function updateHash(link) {
  console.log(link.href);
  let eventHash = link.href.split("#");
  window.location.hash = `#${eventHash.pop()}`;
} 

function showEvent(link) {
  document.querySelectorAll('.show').forEach(show => show.classList.remove("show"));
  link.closest(".event").classList.add("show");
}

let timeSelector = document.querySelector("#timezoneSelect");
timeSelector.addEventListener("change", function () {
  updateCalendar(timeSelector.value), lang;
});

function updateCalendar(targetDate, lang = getNavigatorLanguage()) {
  // using moment to show the date in different locale is an ugly fix. I hope moment and moment-timezone gets merged in the future: see https://github.com/moment/moment-timezone/issues/647 (we should make one version without moment.js onme day)
  let allDays = [];
  document.querySelectorAll(".event").forEach((event) => {
    const targetTime = momentz.tz(event.dataset.fulltime, "UTC").tz(targetDate);
    const showDate = moment(targetTime).clone();
    showDate.locale(lang);
    event.querySelector(".month").innerHTML = showDate.format("MMMM");
    event.querySelector(".daynum").innerHTML = targetTime.format("DD");
    event.querySelector(".hour").innerHTML = showDate.format("LT");
    event.querySelector(".tz").innerHTML = targetTime.format("z");
    event.dataset.updatedTime = targetTime.clone().format();
    event.dataset.updatedDay = targetTime.locale("en-us").format("DD MMMM YYYY");
    // note first and last day to recreate the calendar
    var newItem = targetTime.format("L");
    allDays.indexOf(newItem) === -1 ? allDays.push(newItem) : "";
  });
  console.log(allDays)
  // find number of days
  
  var timeLength = Math.abs(momentz(allDays[allDays.length - 1], "L").diff(
    momentz(allDays[0], "L"),
    "days"
  ));
  console.log(timeLength)
  // create a new calendar
  let newCal = document.createElement("section");
  newCal.classList.add = "calendarNew";

  // create a list for each day
  for (let i = timeLength * -1 ; i < timeLength + 1; i = i + 1) {
    const dayList = document.createElement("ul");
    let day = moment(allDays[0]).add(i, "days");
    day.locale(lang);
    dayList.classList.add(`y-${day.format("YYYY")}d-${day.format("DDDD")}`);
    dayList.classList.add(`${day.clone().locale("en").format("dddd")}`);
    dayList.classList.add(`day`);
    dayList.classList.add("emptyday");
    dayList.id = `day-${day.format("DD")}`;
    dayList.innerHTML = `<h2><span class="day-letter">${day.format(
      "dddd"
    )}</span>
        <span class="number">${day.format(
          "D"
        )}</span> <span class="month">${day.format("MMMM")}</span>
        <span class="year">${day.format("YYYY")}</span></h2>
        `;
    document.querySelectorAll(".event").forEach((event) => {
      if (event.dataset.updatedDay == day.locale("en-US").format("DD MMMM YYYY")) {
        dayList.appendChild(event);
        dayList.classList.remove("emptyday");
      }
    });
    newCal.appendChild(dayList);
  }
  document.querySelector("#calendar").innerHTML = newCal.innerHTML;

  // TODO: check https://davidwalsh.name/event-delegate instead
  // reset event Listener
  document.querySelectorAll("#calendar .event:not(.show) a.acc").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      link.closest(".event").classList.add("show");
    });
  });
  document.querySelectorAll(".close").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".event").classList.remove("show");
    });
  });
}

document.querySelectorAll(".back").forEach((back) => {
  back.addEventListener("click", function () {
    back.closest(".event").classList.remove("show");
  });
});

function showEventFromHash() {
  if (document.querySelector(`${window.location.hash.replace("/", "")}`)) {
    document.querySelectorAll('.show').forEach(show => show.classList.remove("show"));
    document
      .querySelector(`${window.location.hash.replace("/", "")}`)
      .closest(".event")
      .classList.add("show");
  }
}

if (window.location.hash) {
  window.onload = showEventFromHash()
}

window.addEventListener("hashchange", function() {
  window.onload = showEventFromHash()
});

document.querySelectorAll('.event').forEach(event => {
  let eventdate = moment(event.dataset.fulltime);
  if (moment().diff(eventdate.add(1, 'hours')) > 0) {
    event.classList.add('passed')
  };
})
