const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

function calculateEndTime(time, hours) {
  let [h, m] = time.split(":").map(Number);
  let date = new Date();
  date.setHours(h);
  date.setMinutes(m + hours * 60);
  return date.toTimeString().slice(0,5);
}

app.post("/create-event", async (req, res) => {
  const data = req.body;

  const endTime = calculateEndTime(data.time, data.hours || 1);

  await calendar.events.insert({
    calendarId: "primary",
    resource: {
      summary: "Schoonmaak - " + data.name,
      location: data.address,
      description: data.phone,
      start: {
        dateTime: `${data.date}T${data.time}:00`,
        timeZone: "Europe/Amsterdam",
      },
      end: {
        dateTime: `${data.date}T${endTime}:00`,
        timeZone: "Europe/Amsterdam",
      },
    },
  });

  res.send({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server draait op " + PORT));
