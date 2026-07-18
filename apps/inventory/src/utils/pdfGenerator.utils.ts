import { DATE_MONTH_YEAR_FORMAT } from "@repo/shared/utils/constants.utils.js";
import dayjs from "dayjs";
import * as fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import * as puppeteer from "puppeteer";

export const generatePDF = async (
  templatePath: string,
  data: Record<string, any>,
): Promise<Buffer> => {
  const tpl = fs.readFileSync(templatePath, "utf8");
  const tplDir = path.join(
    process.cwd(),
    "src",
    "templates",
    "pdf",
    "reports-pdf",
  );

  Handlebars.registerHelper("formatDate", (date) =>
    date ? dayjs(date).format(DATE_MONTH_YEAR_FORMAT) : "",
  );

  const template = Handlebars.compile(tpl);
  const bodyHtml = template(data);

  const headerTl = fs.readFileSync(path.join(tplDir, "header.hbs"), "utf8");
  const footerTl = fs.readFileSync(path.join(tplDir, "footer.hbs"), "utf8");

  const templateHeaderHtml = Handlebars.compile(headerTl);
  const headerHtml = templateHeaderHtml(data);

  const templateFooterHtml = Handlebars.compile(footerTl);
  const footerHtml = templateFooterHtml(data);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    userDataDir: "/tmp/puppeteer",
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      request.continue(); // Allow images to be loaded
    } else {
      request.continue();
    }
  });

  const html = `
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body {
            font-family: "Poppins", sans-serif;
          }
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            text-align: center;
            background-color: #f1f1f1;
            padding: 10px;
            font-weight: bold;
          }
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            background-color: #f1f1f1;
            padding: 10px;
            font-weight: bold;
          }
          .content {
            margin-top: 50px;
            margin-bottom: 50px;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #d7f4f6;
          }
        </style>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap"
          rel="stylesheet">
      </head>
      <body>
      ${headerHtml}
        ${bodyHtml} 
      </body>
    </html>
  `;

  // Set the content in the page
  await page.setContent(html, { waitUntil: "load" });
  page.on("console", (msg) => {
    console.log("PAGE LOG:", msg.text());
  });

  page.on("error", (err) => {
    console.error("Error in page:", err);
  });
  // Generate PDF and return buffer
  const pdfBuffer = await page.pdf({
    format: data.format ? data.format : "A4",
    landscape: data.landscape ? data.landscape : false,
    printBackground: true,
    displayHeaderFooter: true,
    // headerTemplate: headerHtml,
    footerTemplate: footerHtml,
    margin: {
      top: "60px", // Space for header
      bottom: "70px", // Space for footer
      left: "40px",
      right: "40px",
    },
    waitForFonts: true,
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
};
