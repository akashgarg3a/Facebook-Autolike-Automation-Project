let puppet = require('puppeteer');
let fs = require('fs');
let path = require('path');
let cmain = process.argv[2];
let cname = process.argv[3];
(async function () {
    try {
        console.log(cmain);
        let contents = await fs.promises.readFile(cmain);
        let content = await JSON.parse(contents);
        let id = content.id;
        let pwd = content.pwd;
        let broswer = await puppet.launch({
            headless: false,
            defaultViewport: null,
            slowMo: 10,
            args: ['--start-maximized', '--disable-notification']
        })
        let pages = await broswer.pages();
        let page = pages[0];
        await page.goto('http://www.pepcoding.com/login');
        await page.type('input[type=email]', id);
        await page.type('input[type=password]', pwd);
        await page.click('button[type=submit]');

        let geturl = await page.waitForSelector('div.resource a');
        let nextPageUrl = await geturl.evaluate(function (ele) {
            return ele.getAttribute('href');
        }, geturl);

        await page.goto('http://www.pepcoding.com' + nextPageUrl, { waitUntil: 'networkidle0' });

        await page.waitForSelector('div#siteOverlay', { visible: false });

        await page.waitForSelector('h2.courseInput', {
            visible: true
        });
        let AllCourses = await page.$$('h2.courseInput');
        let requiredCourse;
        for (let x = 0; x < AllCourses.length; x++) {
            let currName = await AllCourses[x].evaluate(el => el.textContent);

            if (currName.trim() == cname) {
                requiredCourse = AllCourses[x];
                break;
            }
        }
        await requiredCourse.click();


        let mdata = process.argv[4];
        let Content = await fs.promises.readFile(mdata);
        let metadata = await JSON.parse(Content);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        let CouseUrl = page.url();
        for (let x = 0; x < metadata.questions.length; x++) {
            await page.goto(CouseUrl);
            await SolveQuestion(metadata.questions[x], page);
            console.log("Question " + x + "th solved");
        }
        console.log('Done :)');

    }
    catch (err) {
        console.log(err);
    }

})();

async function SolveQuestion(question, page) {
    try {
        await getToProblemPage(question, page);
        
        await page.waitForSelector('.lang');
        await page.click('.lang');

        let Contents = await fs.promises.readFile(path.join(question.path, 'main.java'));
        await page.type('#customInput', Contents + "");
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.down('Control');
        await page.keyboard.press('x');
        await page.click('textarea.ace_text-input');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.down('Control');
        await page.keyboard.press('v');
        await page.keyboard.up('Control');
        await page.click('a#submitCode');
        await page.waitForSelector('span.col.l7.s3');
        let testCases = await page.$$('#testCases');
        let testcasesValues = [];
        //iterate for each testcase row 
        for (let i = 0; i < testCases.length; i++) {
            //get all values for each testcase
            let Inputs = await testCases[i].$$("input[type=hidden]");
            let InputArr = [];
            let InputVal = await Inputs[0].evaluate(el => el.getAttribute("value"));
            let ExpectedOP = await Inputs[1].evaluate(el => el.getAttribute("value"));
            let ActualOP = await Inputs[2].evaluate(el => el.getAttribute("value"));
            InputArr = [InputVal, ExpectedOP, ActualOP];
            //push the value to testcasesArray
            testcasesValues.push(InputArr);
        }


        let ObjArray = testcasesValues.map(function (row) {
            return {
                input: row[0],
                expected: row[1],
                actual: row[2]
            }

        });

        //write to file 
        await fs.promises.writeFile(
            path.join(question.path, "tc.json"),
            JSON.stringify(ObjArray)
        );
    }

    catch (err) {
        console.log(err);
    }
}

async function getToProblemPage(question, page) {
    try {
        await page.waitForSelector('li.lis.tab div.hoverable');
        let getLists = await page.$$('li.lis.tab div.hoverable');
        let InCourse;
        for (let x = 0; x < getLists.length; x++) {
            let currVal = await getLists[x].evaluate(function (el) {
                return el.textContent;
            }, getLists[x]);
            currVal = currVal.trim();
            if (currVal === question.module) {
                InCourse = getLists[x];
                break;
            }
        }

        await InCourse.click();
        await page.waitForSelector('a p.title', { visible: true });
        let inQuestion = await page.$$('a p.title');
        let questionPage;
        for (let x = 0; x < inQuestion.length; x++) {
            let currQuestion = await inQuestion[x].evaluate(function (el) {
                return el.textContent;
            });
            currQuestion = currQuestion.trim();
            if (currQuestion === question.lecture) {
                questionPage = inQuestion[x];
                break;
            }
        }

        await questionPage.click();
        await page.waitForSelector('p.no-margin');
        let getProblems = await page.$$('p.no-margin');
        let problemPage;

        for (let x = 0; x < getProblems.length; x++) {
            let currProblem = await getProblems[x].evaluate(function (el) {
                return el.textContent;
            });
            currProblem = currProblem.trim();
            if (currProblem.includes(question.title)) {
                problemPage = getProblems[x];
                break;
            }
        }
        await problemPage.click();
        console.log('problem page');
    }
    catch (err) {
        console.log(`*******************------------------------**********************
        ` + err);
    }
}