const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/html-to-pdf', (req, res) => {

  const { html } = req.body;

  if (!html) {
    return res.status(400).send('No se proporcionó HTML');
  }

  puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    .then(browser => browser.newPage()
      .then(page => {
        return page.setContent(html, { waitUntil: 'networkidle0' })
          .then(() => page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
          }))
          .then(pdf => {
            browser.close();
            res.contentType('application/pdf');
            res.send(pdf);
          });
      }))
    .catch(error => {
      console.error('Error al generar PDF:', error);
      res.status(500).send('Error al generar PDF');
    });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});