const puppeteer = require("puppeteer");

const credentials = {
  username: "thehiendev",
  password: "875267abcX123",
};

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await loginInQuizlet(page);
    const links = [
      "https://quizlet.com/vn/500098431/prf-flash-cards/",
      //"https://quizlet.com/196701779/pro-192-full-flash-cards/",
    ];

    const subjects = await Promise.all(
      links.map((link) => getQuestionAsync(page, link))
    );
    console.log(subjects[0].questions[0]);
  } catch (error) {
    console.log(error);
  }
  browser.close();
};

const getQuestionAsync = async (page, link) => {
  await page
    .goto(link, {
      waitUntil: "networkidle2",
    })
    .catch((e) => void 0);

  const questions = await page.evaluate(() => {
    const questionsWrapper = Array.from(
      document.querySelectorAll("div.SetPageTerm-content")
    );
    const questions = questionsWrapper.map((ques) => {
      const ansText = ques.querySelector(".SetPageTerm-sideContent > a > span")
        .innerHTML;
      const contents = ques
        .querySelectorAll(".SetPageTerm-sideContent > a > span")[1]
        .innerHTML.split(/([A-Z]\. [\w\d \.;_-]+)/g);
      const quesText = contents[0];
      const ansArray = contents.slice(1).filter((ans) => ans && ans !== "<br>");
      const correctAnsArr = ansArray.filter((ans) =>
        ansText.includes(ans.slice(0, 1))
      );
      return {
        quesText: quesText.replace(/<br>/g, "\n"),
        ansArray: ansArray.map((ans) => ans.replace(/[A-Z]\./g, "").trim()),
        correctAnsArr: correctAnsArr.map((ans) =>
          ans.replace(/[A-Z]\./g, "").trim()
        ),
      };
    });
    return questions;
  });
  return {
    questions: questions,
  };
};

const loginInQuizlet = async (page) => {
  await page.goto("https://quizlet.com/vi", { waitUntil: "networkidle2" });
  await page.waitForXPath("//button[contains(., 'Đăng nhập')]");

  await page.click("div.SiteHeader-signIn > button.UILink--inverted");

  await page.waitForXPath("//input[@name='username']");

  await page.type("input[name='username']", credentials.username);
  await page.type("input[name='password']", credentials.password);

  await page.click("button[aria-label='Đăng nhập']");
};

main();
