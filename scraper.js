// The required npm packages 
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs')
const json2csv = require('json2csv')

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

var allShirts =  []

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
           
      //Appends the shirt id to the full url. 
      var list = url + item
      
      //Makes a request for shirt id url    

      rp(list)
      .then(function(body){

        //Using Cheerio to get html
        const $ = cheerio.load(html)

        const item  = $(el).find('a').attr('href');
        const imageUrl = $(body).find('img').attr('src')
        const title = $(body).find(".shirt-details > h1").text().slice(3);
        const price = $(body).find('.price').text()        
        const shirts = {}

        shirts.title = title
        shirts.price = price
        shirts.imageUrl = imageUrl
        shirts.item = list
        shirts.date = day
        allShirts.push(shirts)
        
        if(allShirts.length === products.length){

          //Using JSON2CSV to put the data in the correct format
        
          const json2csv = require('json2csv').parse;
          const fields = ['Title', 'Price',  'ImageUrl',  'Url',  'Date'];
          const opts = { fields }
                      
              try {
                const csv = json2csv(allShirts, fields);
                //writes the file
                fs.writeFile(`./data/${today}.csv`, csv , (err) => {
              if (err) throw err;
              console.log('The file has been saved!');
            });
            } catch (err) {
              console.error(err);
            }
          }
        })
      })
    })
  })

  .catch(function(err){

    console.log('So Sorry, and Error occured. Please check your internet connection')
    
})