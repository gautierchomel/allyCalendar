npm -i
npm run dev



# Open calendar

When the openpublishingfest started, we needed to have a place to allow people to propose events, accept them and show ’em on a calendar for the public to consult and get ideas about when things happens.
We made a full standard html/css/js website with no framework, and it worked pretty well, so we decided to make it reusable and accessible by using a couple of (simple) frameworks.

The openpublishingfest.org has been supported by the folks of cloud68.co who have a good idea of how the whole thing work.

This readme should let you know how to install and use the calendar for your own need, including styles and categories customizations amongst other surprises :-)

Let’s get rolling by looking at:

1. architecture
2. backend
3. customization options / frontend



## Architecture:

The opencal use two powerfull tools to build itself: 

- [strapi](https://www.strapi.io) to handle the backend and the db. (Cloud68.io are good to setup stuff :D) 
- [eleventy](https://www.11ty.dev/) as the static website generator (that transform all your data into beautiful webpages).

We also use [snowpack](https://www.snowpack.dev/) to handle the build and the js modules, all set and ready to work with node modules and postcss (yay!).


### Strapi 

Strapi is the DB/API engine that allows us to create a schema for the data used to build the fest itself. We use it to store the data and access it using API. Any user who fill the forms will send data to strapi. We set it up this way: anyone can create a new item (event or attendee), and only specific user have read properties. When the data is fetch from the server, we remove any email or sensible data so nothing gets out in the field without specific needs.

Strapi configuration is handled in `api.json` that looks like the following: 

```js

 // strapi server data

{
  

  //  username  with read access to the “events” db in strapi
  "username": "usernameWithReadAccessToStrapi",
  "password": "passWordWithReadAccessToStrapi",
}

```



### Eleventy

Eleventy is an excellent static website generator that can eat so many different data format, that it can mix json, and templating languages, and markdown, and whatever you may think of and build a website out of it without being tied to any framework. It’s brilliant.

To build the website (and the calendar), we run eleventy, that fetches all the data from various entry points, and build itself as a static html website.  

One small detail: before building the calendar with eleventy, we download the data from strapi into a single json file: if someone add a blog post, and that the website is being rebuilt, we don’t need to fetch the data again from the server. (keeping the energy price as low as possible). To do so, we use a `server.js` app, that fetch the data, download the images, create the ICS file for traditionnal calendar apps.

## Building the backend/front

### Install strapi


<!-- Strapi setup -->

Config:

To make the form work: 

- anyone can create an item in the events list
- anyone can create an item in the attendee list

To be able to load the content, you need to set an user with findOne and findAll, and write down this user credentials in `/views/_data/config.json` (along with the server url). 



## Configuration options

### example for the config.json file that must exist in /views/data/config.json

```js
{
    // name of the site
    "siteTitle": "Fest Name!",

    // subtitle for the site
    "siteBaseline": "Fest of the best",

    // Theme (will use this as url to the theme)
    "theme": "basic"
   
    // data used to define the api to send to and to manage from
    "strapi": {

        // // location of your strapi server  (used to pull / push datas)
        "server": "http://strapiserver.com",
        
        // name for each api data
        "apiEvent": "events",
        "apiParticipants": "participants",
        
        // used to build the manager part
        "port": 3128,
        
    },
    
    // Source for the data for the calendar. Can be `markdown` (if the event are set up using markdown (in `events/event01.md`)), or `json`, if the events list are in `_data/events.json`)
    "calendarDataSource": "markdown",
    "calendarDates": {
        // used to limit the possibilities of dates when someone adds an event through the form)
        // start of the event (YYYY-MM-DD)
        "start": "2020-05-17",
        // end of the event (YYYY-MM-DD)
        "end": "2020-05-31"
    },
    // Name and email shown when the form as an error
    "adminName": "Admin Admin Jr",
    "adminEmail": "admin@admin.fr",

    // show buttons: if true, the link appears in the top bar menu (so you can have a menu without archives if you don’t have any yet, or without the calendar if you’re still waiting for proposals)
    // show proposal
    "showForm": true,

    //show the attendee page
    "showAttendees": true,

    // show the calendar page
    "showCalendar": true,

    //show the form for the attendee page
    "showGuestForm": true,

    // show the archive page
    "showArchives": true,

    //show the blog page
    "showBlog": true,

    //show the about page
    "showAbout": true,
    
    // add the list of the speakers after the calendar
    "speakerList": true,
    
    // categories used in the calendar. 
    // the categories are not defined through strapi, but in this config file. The category can either be set in strapi, or in the manage page we added previously. It is set up to use strapi to store the data, but you can easily change that cms and still be able to make the calendar to work.

    // if you don’t want to use the category, make it an empty array.
     "categories": [
        "Demo",
        "Performance",
        "Fireside Chats",
        "Micropubs",
        "Discussion",
        "Long Event"
    ],
    // this define what appears in the menu bar
    "topBar": {
        "title": "Nubia fest!",
        "subtitle": "September 13-19",
        "logo": "<svg width='100%' height='100%' viewBox='0 0 35 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;' fill='grey'><path id='categoryOne' d='M17.288,29.951l17.306,-29.951l-34.594,0l17.288,29.951Z' fill-rule='nonzero'/></svg>"
    },

    // those assets will be used in the app: background, top bar logo, etc. They will be set up inside the html. For example, we have setup here, the logos and background as svgs.
    // warning, using svg in json, or actual html, forces you to use single quote in the html, or you need to escape the characters
    "assets": {
        // logo used somewhere else
        "logo": "",
        // background. what you can see around the calendar
        "background": "<svg width='100%' height='100%' viewBox='0 0 137 42' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'><g id='catTwo'><path d='M17.288,41.954l-17.288,0l-0,-29.951l17.288,29.951Z' fill='#682902' stroke='#682902'/><path d='M136.328,12.084l-0,29.87l-17.297,0l17.278,-29.902l0.019,0.032Z' fill='#682902' stroke='#682902'/></g><path d='M62.733,41.954l-34.594,0l17.307,-29.951l17.287,29.951Z' fill='#92d4f4' stroke='#92d4f4'/><path d='M22.723,29.951l17.287,-29.951l-34.593,-0l17.306,29.951Z' fill='#f1870b' stroke='#f1870b'/><path d='M108.179,41.954l-34.594,0l17.307,-29.951l17.287,29.951Z' fill='#003f42' stroke='#003f42'/><path d='M68.169,29.951l17.287,-29.951l-34.594,-0l17.307,29.951Z' fill='#f1ea00' stroke='#f1ea00'/><path d='M113.614,29.951l17.288,-29.951l-34.594,-0l17.306,29.951Z' fill='#da0060' stroke='#da0060'/></svg>",
        // Image used when the event has no picture
        "imgPlaceHolder": "",
        // illustrations used as icon per category
        "categoryIcon": "<svg width='100%' height='100%' viewBox='0 0 35 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;' fill='grey'><path id='categoryOne' d='M17.288,29.951l17.306,-29.951l-34.594,0l17.288,29.951Z' fill-rule='nonzero'/></svg>",

        "calEventBackground": ""
    }
}
```

#### css

To change the css, you can update the config and set the `"theme"` accordingly. For example, if the theme i use is called `pubpub`, the css folder will be `css/pubpub/source.css`.

Creating a theme from scratch shouldn't be too complex if you know your way with css.

TODO.

- add netlify CMS to manipulate blog post
- add a way to build forms and data with strapi (or netlify cms)





## to add 


If config singlePage is true:
- no menu get shown
- footer appears at the bottom of the calendar

If (menu.timezone) → timezone in the menu
if (menu.calButtons) → timezone in the calButtons


YAML variable

per page:

```YAML
footer: true # add the footer to the page
```