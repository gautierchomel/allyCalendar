// const cron = require("node-cron");
const express = require("express");
const axios = require("axios");
const Path = require("path");
const fs = require("fs");
const ics = require("ics");
const moment = require("moment-timezone");
const configuration = require("./views/_data/config.json")
const api = require("./api.json");
const runScript = require("runscript");

const folder = "static/data/events/images/";
const folderAttendee = "static/data/attendees/images/";
const folderICS = "static/data/events/ics/";


app = express();

app.listen(configuration.strapi.port);

if (!fs.existsSync(`./${folder}`)) {
  fs.mkdirSync(folder, { recursive: true });
}
if (!fs.existsSync(`./${folderAttendee}`)) {
  fs.mkdirSync(folderAttendee, { recursive: true });
}
if (!fs.existsSync(`./${folderICS}`)) {
  fs.mkdirSync(folderICS, { recursive: true });
}

let html = `
<button type="button" onclick="proceed();">do</button> 
<script>
function proceed () {
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', '/');
    form.style.display = 'hidden';
    document.body.appendChild(form)
    form.submit();
}
</script>


<button type="button" onclick="pull();">pull repo</button> 
<script>
function pull () {
    var pullForm = document.createElement('form');
    pullForm.setAttribute('method', 'post');
    pullForm.setAttribute('action', '/pull/');
    pullForm.style.display = 'hidden';
    document.body.appendChild(pullForm)
    pullForm.submit();
}
</script>`;

let token;

async function login(username, password) {
  axios
    .post(`${configuration.strapi.server}/auth/local`, {
      identifier: username,
      password: password,
    })
    .then(function (response) {
      token = response.data.jwt;
      // document.querySelector(".form").remove();
      if (response) {
        load();
        loadAttendees();
      }
    })
    .catch(function (error) {
      console.log("there is an error:", error);
      // p.textContent = "sorry mate can’t connect, forgot you pass again?";
    })
    .finally(function () { });
}

async function load() {
  axios
    .get(`${configuration.strapi.server}/${configuration.strapi.apiEvents}?_limit=-1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(function (response) {
      const data = response.data;
      backupDB(`views/_data/events.json`, data);
      backupIMG(data);
      createICS(data);
      console.log("building the website")
      // console.log('response', response)
    })
    .finally(
      runScript("npm run buildPerm", { stdio: "pipe" })
        .then((stdio) => {
          console.log("website is done, now updating permission");
        })
        .catch((err) => {
          console.error(err);
        })
    )
    .catch(function (error) {
      console.log("error:", error);
    });
}
async function loadAttendees() {
  axios
    .get(`${configuration.strapi.server}/${configuration.strapi.apiParticipants}?_limit=-1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(function (response) {
      const data = response.data;
      backupDBAttendees(`views/_data/attendees.json`, data);
      backupIMGAttendees(data);
      // console.log('response', response)
    })
    .catch(function (error) {
      console.log("error:", error);
    });
}

async function backupDB(filename, data) {
  data.forEach((event, index) => {
    // remove refused events

    if (event.accept != true) {
      // data.splice(data[index], 1)
    }
    // obfuscate user contact for the events (not accessible in the js anymore!)
    event.usermail = " ";

    // create a fullTime key to handle calendar creation and update serverside
    event.fullTime = moment
      .tz(`${event.date}T${event.time}`, event.timezone)
      .utc()
      .format();
  });

  // reorder events

  let content = JSON.stringify(orderByDate(data));

  fs.writeFileSync(filename, content),
    "utf-8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("script is done!");
    };
}

function orderByDate(dates) {
  return dates.sort((a, b) => new moment(a.fullTime).diff(b.fullTime));
}

async function backupIMG(data) {
  // for (var key in data) {
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]].hasOwnProperty("url")) {
      if (data[keys[i]].images) {
        data[keys[i]].images.forEach((img) => {
          // if (img.ext != '.bin') {
          downloadImage(
            configuration.strapi.server + img.url,
            img.hash + img.ext,
            folder
          );

          // }
        });
      }
    }
  }
}

async function backupDBAttendees(filename, data) {
  data.forEach((attendee, index) => {
    attendee.mail = " ";
  });
  let content = JSON.stringify(data);
  fs.writeFileSync(filename, content),
    "utf-8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    };
}
async function backupIMGAttendees(data) {
  // for (var key in data) {
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]].picture === null) {
    } else if (
      data[keys[i]].picture.ext != ".bin" ||
      data[keys[i]].picture != null
    ) {
      downloadImage(
        configuration.strapi.server + data[keys[i]].picture.url,
        data[keys[i]].picture.hash + data[keys[i]].picture.ext,
        folderAttendee
      );
    }
  }
}

async function createICS(data) {
  data.forEach((ev) => {
    const dateStart = moment.tz(`${ev.date}T${ev.time}`, ev.timezone).utc();
    console.log(dateStart);
    // parse with NYC time, and then convert to UTC
    // let startTime = moment.tz(strStartTime, "America/New_York").utc();
    // let endTime = moment.tz(strEndTime, "America/New_York").utc();

    // convert dates to array
    startTime = [
      dateStart.get("year"),
      dateStart.get("month") + 1,
      dateStart.get("date"),
      dateStart.get("hour"),
      dateStart.get("minute"),
    ];
    console.log(startTime);

    ics.createEvent(
      {
        title: ev.title,
        description:
          ev.description +
          `  \n\nWARNING: TIME AND DATES MAY CHANGE, \nBE SURE TO CHECK THE EVENT ON THE WEBSITE: \n\n${configuration.siteURL}/calendar.html#event-${ev.id}\n\n and get the latest news on ${configuration.siteURL}/calendar.html#event-${ev.id}`,
        busyStatus: "FREE",
        start: startTime,
        URL: ev.link,
        startInputType: "utc", // I define the start time as UTC
        duration: { minutes: 60 },
        // start: [2000, 05,16,10, 30],
      },
      (error, value) => {
        if (error) {
          console.log(error);
        }

        fs.writeFileSync(`${__dirname}/${folderICS}/event-${ev.id}.ics`, value);
        console.log("ics created:", ev.title);
      }
    );
  });
}

app.use(express.static("events"));

app.get("/", function (req, res) {
  res.send(html);
});



app.get("/rebuild/", function (res, req) {
  login(api.username, api.password);
})

app.get("/pullDaRepo/", function (res, req) {
  runScript("npm run pullRepo", { stdio: "pipe" })
    .then((stdio) => {
      console.log("pull the repo");
      console.log(stdio);
    }).then(
      login(api.username, api.password)
    )
    .catch((err) => {
      console.error(err);
    });
})



app.post("/", function (req, res) {
  login(api.username, api.password);
  res.send("done");
});

app.get("/pull/", function (req, res) {
  res.send(html);
});

app.post("/pull/", function (req, res) {
  runScript("npm run pullRepo", { stdio: "pipe" })
    .then((stdio) => {
      console.log("pull the repo");
      console.log(stdio);
    }).then(
      login(api.username, api.password)
    )
    .catch((err) => {
      console.error(err);
    });
});

async function downloadImage(url, file, location) {
  const path = Path.resolve(__dirname, location, file);
  const writer = fs.createWriteStream(path);

  console.log("image copied:", url);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// devmode
// to run the app when the content is updated
// login(api.username, api.password);
