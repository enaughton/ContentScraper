// The required npm packages 
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs')

//Entry Point of the Scraper
const url = 'http://shirts4mike.com/'


//Date info for File, and File Name
const day = new Date().toLocaleString()
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
} 

if(mm<10) {
    mm = '0'+mm
} 

today = yyyy + '-' + mm + '-' + dd;

//Makes the Data Directory if its not created 

var dir = './data';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }


// Creation of the CSV file in the Data Directory
//Writes the Headers for the CSV file

const writeStream = fs.createWriteStream(`./data/${today}.csv`)

writeStream.write(`Title Price ImageUrl Url Date \n`);


//Makes a request to the urel using the requst-promise package
  
rp(url)
  .then(function(html){
    //Using Cheerio to get html
    const $ = cheerio.load(html)

    //finds the shirts.php page
    const shirt = $('.button> a').attr('href')

    //Appends shirt.php to the main url 
    var list = url + shirt
    
    //Makes a request for the http://shirts4mike.com/shirts.php
    rp(list)
    .then(function(html){

    //Using Cheerio to get html
    const $ = cheerio.load(html)

    //Finds the li tags in the products class. 

    const products = $('.products').find('li')
    //loops through the products class
    products.each((i, el) =>{
      //Finds the link for each of the shirts. 
      const item  = $(el).find('a').attr('href');
      //image Url
      const link = $(el).find('img').attr('src')
      const alt = $(el).find('img').attr('alt')
      
      //Appends the shirt id to the full url. 
      var list = url + item
      
      //Makes a request for shirt id url         
      rp(list)
      .then(function(body){

        //Using Cheerio to get html
        const $ = cheerio.load(html)

        const item  = $(el).find('a').attr('href');
        const imageUrl = $(body).find('img').attr('src')
        const title = $(body).find(".shirt-details > h1").text().replace(/\s+/g, "").slice(3);
        const price = $(body).find('.price').text()   

        writeStream.write(`${title} ${price} ${imageUrl} ${list} ${day} \n`)

        
        
      })
    })
    console.log('Scraping Complete!!!!')
  })
})
 
  .catch(function(err){

    console.log('So Sorry, and Error occured. Please check your internet connection')
    
  })

