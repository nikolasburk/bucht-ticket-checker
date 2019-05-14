const fs = require('fs') 
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const nodeMailer = require('nodemailer')
const cron = require("node-cron")
const datetime = require('node-datetime');

const url = 'https://www.tixforgigs.com/site/Pages/Shop/TicketResales.aspx?ID=27668'
const searchString = '.RESULTS_count'
const remove = 'ticketsonresale'

function logMessage(message) {
  var dt = datetime.create()
  var formatted = dt.format('m/d/Y H:M:S')
  console.log(formatted, message)
}

async function checkTickets() {

  // Load HTML
  const response = await fetch(url)
  const html = await response.text()
  // const html = await fs.readFileSync('./test/bucht-mit-ticket.html', 'utf8') // Load test data
  logMessage(`Loaded HTML from ${url}`)

  // Find tickets
  const $ = cheerio.load(html)
  let result = $(searchString).text()
  result = result.replace(/\s/g, "")
  result = parseInt(result.replace(remove, ""))
  logMessage(`${result} tickets available`)

  // Send email 
  if (result > 0) {
    sendEmail('nikolas.burk@gmail.com', result)
  } else {
    logMessage(`No tickets at the moment`)
    // sendEmail('nikolas.burk@gmail.com', 0)
  }

}

function sendEmail(email, ticketNumber) {
  logMessage(`Send email to ${email}`)
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'nikolas.burk@gmail.com',
      pass: process.env.PASSWORD
    }
  })
  let mailOptions = {
    to: email,
    subject: 'Bucht der Träumer Tickets!',
    text: `Es gibt derzeit ${ticketNumber} tickets auf ${url}!`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return logMessage(error)
    }
    logMessage(`Message ${info.messageId} sent: ${info.response}`)
    res.render('index')
  })
}

// Run every minute
cron.schedule("* * * * *", checkTickets)
logMessage(`Cron job started!`)
// checkTickets()

