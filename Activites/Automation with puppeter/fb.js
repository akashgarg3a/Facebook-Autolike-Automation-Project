let puppeteer = require('puppeteer');
let fs = require('fs');

let postToLike = parseInt(process.argv[2]);
let cerdit = process.argv[3];


(async function() {
    let broswer = await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        slowMo:100,
        args:['--start-maximized', '--disable-notifications']
    });
    let pages = await broswer.pages();
    let page = pages[0];
    let content = await fs.promises.readFile(cerdit);
    let contents = JSON.parse(content);
    let id = contents.id;
    let pwd = contents.pwd;
    await page.goto("http://www.facebook.com");
    await page.waitForSelector('.inputtext.login_form_input_box#email');
    await page.type('.inputtext.login_form_input_box#email', id);
    await page.type('.inputtext.login_form_input_box#pass', pwd);
    await page.click('label#loginbutton input');
    
    await page.waitForSelector('input[data-testid=search_input]');
    await page.type('input[data-testid=search_input]', 'DTU Times')

    await page.waitForSelector('button[data-testid=facebar_search_button]');
    await page.click('button[data-testid=facebar_search_button]');

    await page.waitForSelector('._6xu4._6xu5.img');
    await page.click('._6xu4._6xu5.img');

    await page.waitForSelector('span._2yav');
    await page.click('[data-key=tab_posts]');

    await page.waitForSelector('#pagelet_timeline_main_column ._4-u2._4-u8');

    let idx = 0;
    
    do{
        let posts= await page.$$('#pagelet_timeline_main_column ._1xnd >._4-u2._4-u8');
        await likePost(posts[idx]);
        idx++;
       await page.waitForSelector('.uiMorePagerLoader', {
            hidden:true
        });
        
    }
    while(idx < postToLike);
    console.log("broswer open");
})()

async function likePost(ele) {
    let toclick =await ele.$('._666k');
    await toclick.click();
}