const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 20,
        args: ['--start-maximized', '--disable-notifications', '--incognito']
    });
    const page = await browser.newPage();
    //await page.goto('https://www.google.co.in/');

    await page.goto('https://www.facebook.com', {
        waitUntil: 'networkidle2'
    });
    await page.waitForSelector('#email', {
        visible: true
    });

    await page.type('#email', 'sopiben984@gotkmail.com');
    await page.type('#pass', "Deepak@123");
    await page.click("#loginbutton");
    await page.waitForSelector('div._4bl9._42n- textarea', {
        visible: true
    });
    await page.type('div._4bl9._42n- textarea',"hello--Again");
    await page.click("i._4a0a.img.sp_JRe-3TwUeI9.sx_bc14a4")
    // await page.click('/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div/div/div/div/div[2]/div[3]/div[2]/button/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div/div/div/div/div[2]/div[3]/div[2]/button');
    // await page.click('button[type=submit]')
    await page.waitForSelector('button[type=submit]', {
        visible: true
    });
    await page.evaluate(async() => {
        setTimeout(function(){
            console.log('waiting');
        }, 10000)
      });
      await delay(3000);
    await page.click('button[type=submit]')
    console.log("Done!!")
  //await page.screenshot({path: 'example.png'});

 // await browser.close();
})();
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }