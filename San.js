const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const fs = require('fs');
const results = []; 
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async() =>{
    try{
        const csvwriter = createCsvWriter({
            path: 'pro_duct.csv',
            header: [{id: 't0', title: 'Products'},
                     {id: 't1', title: 'Title'},
                     {id: 't2', title: 'Rating'},
                     {id: 't3', title: 'Price'}]
        })
        fs.createReadStream('.csv')
        .pipe(csv({}))
        .on('data', (data) =>results.push(data))
        .on('end', () => {
        //console.log(results);
        })
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://www.flipkart.com/', {waitUntil: 'networkidle0', timeout: 0});
        var login_window = await page.waitForXPath('(/html/body/div[2]/div/div/button)');
        await login_window.click();
        var keywords =[];
        results.forEach(resultss =>{
            for(let key in resultss){
                keyword = `${resultss[key]}`;
                console.log(keyword);
                keywords.push(keyword);
            }
        })
        for(const word of keywords){

            var search = await page.waitForXPath('//*[@id="container"]/div/div[1]/div[1]/div[2]/div[2]/form/div/div/input');
            await search.type(word);
            console.log(word);
            console.log('typed');
            //await page.waitForTimeout(3000);
            
            var s_box = await page.waitForXPath('//*[@id="container"]/div/div[1]/div[1]/div[2]/div[2]/form/div/button');        
            await page.waitForTimeout(5000);
            await s_box.click();   
            console.log('clicked');
       
           
            var link_list = [];
            await page.waitForTimeout(5000);
            await page.waitForXPath('(//a[@class="s1Q9rs"])');
            let link = await page.$x('(//a[@class="s1Q9rs"])');
            for(const k of link){
                let links = await k.evaluate(a => a.href, link[0]);
                link_list.push(links);
                //console.log(link_list);
            }
            console.log(link_list);
        
            var details = [];
            for(const j of link_list){
                try{
               await page.goto(j, {waitUntil: 'networkidle0', timeout: 0});

               await page.waitForXPath('(//h1[@class="yhB1nd"]//span)');
               let title_ele = await page.$x('(//h1[@class="yhB1nd"]//span)');
               let title = await page.evaluate(span => span.textContent, title_ele[0]);
               details.push(title);

               await page.waitForXPath('(//div[@class="_3LWZlK"])');
               let rate_ele = await page.$x('(//div[@class="_3LWZlK"])');
               let rating = await page.evaluate(div => div.textContent, rate_ele[0]);
               details.push(rating);

               await page.waitForXPath('(//div[@class="_30jeq3 _16Jk6d"])');
               let price_ele = await page.$x('(//div[@class="_30jeq3 _16Jk6d"])');
               let price = await page.evaluate(div => div.textContent, price_ele[0]);
               details.push(price);
               console.log({word, title, rating, price});
               var final = [{t0: word, t1: title, t2: rating, t3: price}];
               csvwriter
               .writeRecords(final)
               .then(() => console.log('success'));
                }catch(err){
                    console.log('---')
                }
           }
           link_list.length = 0;
        }
           await page.waitForTimeout(3000);
        }catch(e){
        console.log(e);
    }
})();