import axios from "axios";
import config from "./config.js"



let token;

let population = document.querySelector(".response-participants");
let eventsSpace = document.querySelector(".response-events");

document.querySelector("#submit").addEventListener('click', fetch);
let username, password;
function fetch() {
    username = document.querySelector("#username").value;
    password = document.querySelector("#password").value;
    login(username, password)
}




async function login(username, password) {

    axios
        .post(`${config.server}/auth/local`, {
            identifier: username,
            password: password,
        })
        .then(async function (response) {

            token = response.data.jwt;

            // document.querySelector(".form").remove();
            if (response) {
                await loadAttendees();
                await loadEvents();



                document.querySelector(".form").remove();
                if (document.querySelector('.login-error')) {
                    document.querySelector('.login-error').remove();
                }
                document.querySelector(".pull-rebuild").style.display = "flex";
            }
        })
        .catch(function (error) {
            console.log('there is an error:', error)
            document.querySelector(`.login-error`).innerHTML = `<p class="error">Sorry mate can’t connect, forgot you pass again? Then you need to contact your administrator.</p>`;
        });
}




async function loadUpdates() {

    axios
        .get(`${config.server}/${config.apiEventsUpdate}?_limit=-1&_sort=created_at:DESC`, {

            headers: {
                Authorization: `Bearer ${token}`,
            },
        })


        .then(await function (response) {



            const data = response.data;

            if (data.length > 0) {

                document.querySelector('#showToUpdate').checked = true;
                document.querySelector('.response-events').classList.add('show-toUpdate');

                // console.log(data);
                data.forEach(event => {
                    if (event.eventid) {
                        let eventEl = document.querySelector(`#event-${event.eventid}`);

                        // add the note taking box
                        let note = `
            <label for="note">add a note</label>
            <textarea name="note" class="noteToAdd"></textarea>

            <button class="addnote" onclick="addNote(${event.eventid}, this)">save note</button>`

                        let noteStation = eventEl.querySelector('.updateNote')

                        if (!noteStation) {
                            noteStation = document.createElement('div');
                            noteStation.classList.add('updateNote')
                            noteStation.innerHTML = note;
                            eventEl.insertAdjacentElement('afterbegin', noteStation);
                        }


                        // if there is not update element yet
                        let updates = eventEl.querySelector('.updates')
                        if (!updates) {
                            // create the update element
                            updates = document.createElement('div');
                            updates.classList.add('updates');
                            eventEl.insertAdjacentElement('afterbegin', updates);
                        }
                        let message;
                        if (event.name == 'open publishing fest') {
                            message = `<div class="msg note ${event.done == true ? 'updated hide' : ""}">
<p class="meta"><time>${event.created_at.replace("T", " ").replace("Z", "")} </time>note:</p> <p class="message">${event.needs}</p>
<button class="archiveUpdate" onclick="updateArchive(${event.id}, this)">Archive this message</button>
</div>`
                        } else {

                            message = `<div class="msg ${event.done == true ? 'updated hide' : ""}">
<p  class="meta"><time>${event.created_at.replace("T", " ").replace("Z", "")} </time>
<span>Message from ${event.name}: <a href= "mailto:${event.email}?subject=Open%20Publishing%20Fest:%20requested%20change%20is%20done&body=Hi%0D%0A%0D%0AWe%20made%20the%20requested%20change:%0D%0A%0D%0A${event.needs.replace(' ', '%20')}%0D%0A%0D%0AHave%20a%20great%20day!" > ${event.email} </a></p>
<p class="message"> ${event.needs}</p>
<button class="archiveUpdate" onclick="updateArchive(${event.id}, this)">Archive this message</button>
</div>`
                        }


                        updates.insertAdjacentHTML('beforeend', message)


                        if (event.done != true) {
                            eventEl.classList.add('toUpdate');
                            eventEl.classList.remove('hide');
                        }







                        // content.insertAdjacentHTML('beforeend', archive)
                        eventEl.insertAdjacentElement('afterbegin', updates);

                    }
                })
            }

        })
}



async function loadAttendees() {
    axios
        .get(`${config.server}/${config.apiParticipants}?_limit=-1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(function (response) {

            document.querySelector(".hide").classList.remove("hide");

            const data = response.data;
            showParticipants(data)


        })
        .catch(function (e) {
            console.log('e:', e);
        })
}

async function loadEvents() {
    axios
        .get(`${config.server}/${config.apiEvents}?_limit=-1`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(async function (response) {
            const data = response.data;
            await showEvents(data)
            await mailToEveryone(data)
            await mailToEveryoneWithNoLink(data)
            loadUpdates();
            // document.querySelector("#showEventNull").checked = true;
            // document.querySelector("#showToUpdate").checked = true;
        })
        .catch(function (e) {
            console.log('e:', e);
        })
}



async function acceptOne(id, el) {

    axios
        .put(`${config.server}/${config.apiParticipants}/${id}`, { "accept": true }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })
        .then(function (response) {
            el.closest("li").classList = 'accepted-user';
        })
        .catch(error => {
            console.log(error);
        });

}





async function refuseOne(id, el) {

    axios
        .put(`${config.server}/${config.apiParticipants}/${id}`, { "accept": false }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })
        .then(function (response) {
            el.closest("li").classList = 'refused-user';
        })
        .catch(error => {
            console.log(error);
        });

}



async function updateEvent(id, el) {

    axios
        .put(`${config.server}/${config.apiEvents}/${id}`,
            {
                "archive": false,

            }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })
        .then(function (response) {
        })
        .catch(error => {
            console.log(error);
        });

}


async function showParticipants(response) {
    let news;

    // sort per name 


    let orderedResponse = response.sort(dynamicSort("name"));


    document.querySelector('.manage-participants h2').insertAdjacentHTML('beforeend', ` <small>(total count: ${orderedResponse.length})</small>`);

    orderedResponse.map(participant => {

        let acceptValue;

        if (participant.picture != null) {
            if (participant.picture.ext != ".bin") {

                if (participant.accept === null) {
                    news = true;
                    acceptValue = 'null ';
                } else if (participant.accept == true) {
                    acceptValue = 'accepted-user hide'
                } else {
                    acceptValue = 'refused-user hide';
                }


                let participantEntry = `
                <li class="${acceptValue}">
                    <div class="data">
                        <img src="${config.server + participant.picture.url}">
                        <div class="contacts">
                            <span class="name">${participant.name}</span>
                            <a class="mail" href="mailto:${participant.mail}" class="mail">${participant.mail}</a>
                        </div>

                    </div>
                    <div class="controls">
                        <button onclick="acceptOne(${participant.id}, this)" class="ok">accept</button>
                        <button onclick="refuseOne(${participant.id}, this)" class="nope">refuse</button>
                    </div>
                </li>`


                population.insertAdjacentHTML("beforeend", participantEntry)
            }
            if (news) {
                // document.querySelector('.noNews').remove();
            } else {
                document.querySelectorAll('#showNull, [for="showNull"]').forEach(el => el.style.display = "none")
            }
        }
    })
}


// search







document
    .querySelectorAll('.tools .participant-checkbox').forEach(input => {
        input.addEventListener('change', function () {
            if (input.checked == true) {
                document.querySelectorAll(`.${this.dataset.participantType}`).forEach(item => {
                    item.classList.remove('hide')
                })
            }
            else {
                document.querySelectorAll(`.${this.dataset.participantType}`).forEach(item => {
                    item.classList.add('hide')
                })
            }

        })
    })

document
    .querySelectorAll('.tools .event-checkbox').forEach(input => {
        input.addEventListener('change', function () {
            if (input.checked == true) {
                // document.querySelectorAll(`.${this.dataset.eventType}`).forEach(item => {
                //     item.classList.remove('hide')
                // })
                document.querySelector(".response-events").classList.add(`show-${this.dataset.eventType}`)
            }
            else {
                // document.querySelectorAll(`.${this.dataset.eventType}`).forEach(item => {
                //     item.classList.add('hide')
                // })
                document.querySelector(".response-events").classList.remove(`show-${this.dataset.eventType}`)

            }

        })

    })


document.querySelector('#showArchivedUpdates').addEventListener('change', function () {
    if (this.checked == true) {
        // document.querySelectorAll('.msg.updated').forEach(msg => {
        //     msg.classList.remove('hide')
        // }) 
        document.querySelector(".response-events").classList.add('show-archive-updates')


    } else {
        document.querySelector(".response-events").classList.remove('show-archive-updates')
        // document.querySelectorAll('.msg.updated').forEach(msg => {
        //     msg.classList.add('hide')
        // }) 
    }
})


document.querySelector('#showEventWithNoURL').addEventListener('change', function () {
    if (this.checked == true) {
        // document.querySelectorAll('.needlink').forEach(el => {
        //     if(el.classList.contains('accepted-event')) {
        //     el.classList.remove('hide')
        //     }
        // }) 
        document.querySelector(".response-events").classList.add("show-needlink")
    } else {
        // document.querySelectorAll('.needlink').forEach(el => {
        //     el.classList.add('hide')
        // }) 
        document.querySelector(".response-events").classList.remove("show-needlink")
    }
})


function sortObj(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}





/**
 * Function to sort alphabetically an array of objects by some specific key.
 * 
 * @param {String} property Key of the object to sort.
 */
function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}



// search
if (document.querySelector("input#search")) {
    document.querySelector("input#search").addEventListener("keyup", function () {
        searchInYall(this);
    });
}



function searchInYall(input) {
    // const input = document.querySelector('#search');
    let filter = input.value.toUpperCase();
    let yallList = document
        .querySelectorAll(".response-participants li");

    // Loop through all list items, and hide those who don't match the search query
    yallList.forEach((person) => {
        let txtValue =
            person.textContent.toUpperCase() || person.innerText.toUpperCase();
        if (txtValue.indexOf(filter) > -1) {
            person.style.display = "";
        } else {
            person.style.display = "none";
        }
    })
}


async function mailToEveryone(data) {
    let mailingList = '&bcc='
    data.map(event => {
        if (event.accept == true) {
            mailingList = mailingList + event.usermail + ';';
        }
    })

    let mailbody = `Please%20check.%20If%20any%20information%20needs%20updating%20please%20use%20this%20form:%0D%0A%0D%0Ahttps://openpublishingfest.org/updateEvent.html%0D%0A%0D%0AAdam`
    let mailEveryone = document.createElement('a');
    mailEveryone.classList.add('button');
    mailEveryone.innerHTML = "Mail everyone"
    mailEveryone.href = `mailto:adam@coko.foundation?object=Open%20Publishing%20Fest:${mailingList}&body=${mailbody}`
    document.querySelector('.pull-rebuild').insertAdjacentElement('beforeend', mailEveryone);
}


async function mailToEveryoneWithNoLink(data) {
    let mailingList = '&bcc='
    data.map(event => {
        if (event.accept == true && !event.url.includes("http")) {
            mailingList = mailingList + event.usermail + ';';
        }
    })


    let mailbody = `Hi there!
%0D%0A
%0D%0A
It seems that you haven’t sent us the link to the live stream of your Open Publishing Fest event.
%0D%0A
%0D%0A
To add a link please do so using the form here: https://openpublishingfest.org/updateEvent.html .
%0D%0A
%0D%0A
If you don't have a streaming URL for your live event and would like us to supply one please use the form also to state that you need this set up for you. 
%0D%0A
%0D%0A
Note: we use Big Blue Button (https://bigbluebutton.org/) for this, if you are not familiar with Big Blue Button then it is far more preferable to use your own technology (zoom etc) as we have limited ability to support folks.
%0D%0A
%0D%0A
If you already sent a streaming URL you will use, please disregard this email.
%0D%0A
%0D%0A
Thanks!
%0D%0A
%0D%0A
Adam`

    // let mailbody = `Please%20check.%20If%20any%20information%20needs%20updating%20please%20use%20this%20form:%0D%0A%0D%0Ahttps://openpublishingfest.org/updateEvent.html%0D%0A%0D%0AAdam`
    let mailEveryoneNoLink = document.createElement('a');
    mailEveryoneNoLink.classList.add('button');
    mailEveryoneNoLink.innerHTML = "Mail all missing links"
    mailEveryoneNoLink.href = `mailto:adam@coko.foundation?object=Open%20Publishing%20Fest:${mailingList}&body=${mailbody.replace(" ", "%20")}`
    document.querySelector('.pull-rebuild').insertAdjacentElement('beforeend', mailEveryoneNoLink);
}



async function showEvents(response) {
    // sort by date

    // let orderedResponseEvents = response.sort(dynamicSort("username"));


    // count accepted / refused event;

    let accepted = 0;
    let refused = 0;
    let nulled = 0;




    // find categories

    let categories;

    config.categories.forEach(el => {
        categories += `<option value="${el}">${el}</option>`
    })

    response.map(event => {
        let eventAcceptValue, news;
        if (event.accept == null) {
            news = true;
            eventAcceptValue = 'nulled-event';
            nulled++;
        } else if (event.accept == true) {
            eventAcceptValue = 'accepted-event'
            accepted++;
        } else if (event.accept == false) {
            eventAcceptValue = 'refused-event';
            refused++;
        }

        let eventEntry = `
        <li class="${eventAcceptValue} ${!event.url.includes('http') ? 'needlink' : ''}" id="event-${event.id}">
            <section class="data">
            <p><span class="name"><small>id</small>${event.id}</p>
                ${event.picture ? '<img class="image" src="' + server + event.picture.url + '"/>' : ''} 
                <p> <span class="name"><small>from</small>  ${event.username}</span> 
                <span class="mail"><a href="mailto:${event.usermail}?subject=Open%20Publishing%20Fest:%20${event.title.replace(" ", '%20')}&body=Link%20to%20your%20event:%20${config.siteURL}/calendar.html#event-${event.id}">Send mail to ${event.usermail} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></a></span></p>
                <p class="title"><small>title</small> ${event.title}</p>   
                <p class="description"><small>description</small> ${event.description}</p>   
                ${event.more ? '<p class="more"><small>more</small> ' + event.more + '</p>' : ''} 

                <p class="language"><small>language</small> ${event.language}</p>
                <p class="tags"><small>tags</small> ${event.tags}</p>   
            </section>
            <section  class="controls">
            <label>
            <span>category:</span>
            <select id="category" name="category" type="text" value="${event.category}"/>
            <option value="${event.category}">${event.category}</option>
            ${categories}
            </select>
        </label>
     

            <label>
                <span>Link:</span>
                <input id="url" name="url" type="text" placeholder="https://www.something.service" value="${event.url}"/>
            </label>

            <label>
            <span>Instruction to join:</span>
            <textarea id="urlinstructions" name="urlinstructions" type="text">${event.urlinstructions}</textarea>
        </label>
        <label>
        <span>archive link:</span>
        <input id="archiveLink" name="archiveLink" type="text" placeholder="" value="${event.archiveLink ? event.archiveLink : ""}"/>
    </label>

        <label>
                <span>Date <small>(YYYY-MM-DD)</small></span>
                <input id="date" type="date" name="date" value="${event.date}" />
                
            </label>
            <label>
                <span>Time <small>(HH:MM:SS)</small></span>
                <input id="time" type="time" name="time" value="${event.time}" />
                
            </label>
            <label>
                <span>Timezone</span>
                <select name="timezone" id="timezoneSelect">
                <option value="${event.timezone}" selected>${event.timezone}</option>
                ${timezoneoptions}
                </select>
            </label>
            <label>
                <span>accept</span>
                <select id="accept" name="acceptEvent" id="acceptEvent" >

                    <option ${event.accept == null ? 'selected' : ' '}></option>
                    <option ${event.accept == true ? 'selected' : ' '} value="true">yes</option>
                    <option ${event.accept == false ? 'selected' : ' '} value="false">no</option>
                </select> 
            </label>
            <label class="opa">
            <input id="opanominee" type="checkbox" ${event.opanominee == true ? "checked" : ""} />
            <span class="radio">Open Publishing Awards Nominee</span> 
            </label>
        <button onclick="updateOne(${event.id}, this)" class="update">update</button>      
        </section>
    </li>`

        eventsSpace.insertAdjacentHTML("beforeend", eventEntry)
    })
    document.querySelector('.manage-events h2').insertAdjacentHTML('beforeend', ` <small>(total count: ${response.length}, accepted: ${accepted}, refused: ${refused}</small>)`);
    if (nulled > 0) {
        document.querySelector('#showEventNull').checked = true;
        document.querySelector('.response-events').classList.add('show-nulled-event');
    }
}



if (document.querySelector("input#searchEvents")) {
    document.querySelector("input#searchEvents").addEventListener("keyup", function () {

        if (this.value.length > 1) {
            searchInAllEvents(this);


        } else {

            let yallList = document
                .querySelectorAll(".response-events li");
            yallList.forEach(event => {
                event.classList.remove('found');
                event.style.display = "";
            })

        }

    });
}
function searchInAllEvents(input) {
    // const input = document.querySelector('#search');
    let filter = input.value.toUpperCase();
    let yallList = document
        .querySelectorAll(".response-events li");

    // Loop through all list items, and hide those who don't match the search query
    yallList.forEach((event) => {
        let txtValue =
            event.textContent.toUpperCase() || event.innerText.toUpperCase();
        if (txtValue.indexOf(filter) > -1) {
            event.classList.add('found');
            event.style.display = "block";
        } else {
            event.classList.remove('found');
            event.style.display = "none";
        }
    })
}


// document.querySelectorAll('.update').forEach(btn => btn.addEventListener(''))


async function updateArchive(id, el) {
    axios
        .put(`${config.server}/${config.apiEventsUpdate}/${id}`, {
            "done": true
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        }).then(
            el.closest('.msg').classList.add('updated')
        )
        .catch(error => {
            console.log(error);
        });
}


async function updateOne(id, el) {
    let data = {};
    Object.assign(data, { url: el.closest('li').querySelector("#url").value });
    Object.assign(data, { date: el.closest('li').querySelector("#date").value });
    Object.assign(data, { time: el.closest('li').querySelector("#time").value });
    Object.assign(data, { timezone: el.closest('li').querySelector("#timezoneSelect").value });
    Object.assign(data, { accept: el.closest('li').querySelector("#accept").value });
    Object.assign(data, { category: el.closest('li').querySelector("#category").value });
    Object.assign(data, { category: el.closest('li').querySelector("#opanominee").value });
    let json = JSON.stringify(data)

    axios
        .put(`${config.server}/${config.apiEvents}/${id}`, {
            "url": el.closest('li').querySelector("#url").value,
            "archiveLink": el.closest('li').querySelector("#archiveLink").value,
            "urlinstructions": el.closest('li').querySelector("#urlinstructions").value,
            "date": el.closest('li').querySelector("#date").value,
            "time": el.closest('li').querySelector("#time").value,
            "timezone": el.closest('li').querySelector("#timezoneSelect").value,
            "accept": el.closest('li').querySelector("#accept").value,
            "category": el.closest('li').querySelector("#category").value,
            "opanominee": el.closest('li').querySelector("#opanominee").checked ? true : false
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })
        .then(function (response) {
            console.log('response', response);
            console.log(el.closest('li').querySelector("#accept").value);
            if (el.closest('li').querySelector("#accept").value == "true") {
                el.closest("li").classList = 'accepted-event';

            } else if (el.closest('li').querySelector("#accept").value == "false") {
                el.closest("li").classList = 'refused-event';
            }
            else {
                el.closest("li").classList = 'nulled-event';
            }



            // document.querySelector("section.updat").innerHTML = '<p class="thanks">Welcome to the band! We’ll add your name to the list.</p>';
        })
        .catch(error => {
            console.log(error);
        });

}




let timezoneoptions = `
<option value="UTC">UTC</option>
<option value="Africa/Abidjan">Africa/Abidjan</option>
<option value="Africa/Accra">Africa/Accra</option>
<option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
<option value="Africa/Algiers">Africa/Algiers</option>
<option value="Africa/Asmara">Africa/Asmara</option>
<option value="Africa/Bamako">Africa/Bamako</option>
<option value="Africa/Bangui">Africa/Bangui</option>
<option value="Africa/Banjul">Africa/Banjul</option>
<option value="Africa/Bissau">Africa/Bissau</option>
<option value="Africa/Blantyre">Africa/Blantyre</option>
<option value="Africa/Brazzaville">Africa/Brazzaville</option>
<option value="Africa/Bujumbura">Africa/Bujumbura</option>
<option value="Africa/Cairo">Africa/Cairo</option>
<option value="Africa/Casablanca">Africa/Casablanca</option>
<option value="Africa/Ceuta">Africa/Ceuta</option>
<option value="Africa/Conakry">Africa/Conakry</option>
<option value="Africa/Dakar">Africa/Dakar</option>
<option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option>
<option value="Africa/Djibouti">Africa/Djibouti</option>
<option value="Africa/Douala">Africa/Douala</option>
<option value="Africa/El_Aaiun">Africa/El_Aaiun</option>
<option value="Africa/Freetown">Africa/Freetown</option>
<option value="Africa/Gaborone">Africa/Gaborone</option>
<option value="Africa/Harare">Africa/Harare</option>
<option value="Africa/Johannesburg">Africa/Johannesburg</option>
<option value="Africa/Juba">Africa/Juba</option>
<option value="Africa/Kampala">Africa/Kampala</option>
<option value="Africa/Khartoum">Africa/Khartoum</option>
<option value="Africa/Kigali">Africa/Kigali</option>
<option value="Africa/Kinshasa">Africa/Kinshasa</option>
<option value="Africa/Lagos">Africa/Lagos</option>
<option value="Africa/Libreville">Africa/Libreville</option>
<option value="Africa/Lome">Africa/Lome</option>
<option value="Africa/Luanda">Africa/Luanda</option>
<option value="Africa/Lubumbashi">Africa/Lubumbashi</option>
<option value="Africa/Lusaka">Africa/Lusaka</option>
<option value="Africa/Malabo">Africa/Malabo</option>
<option value="Africa/Maputo">Africa/Maputo</option>
<option value="Africa/Maseru">Africa/Maseru</option>
<option value="Africa/Mbabane">Africa/Mbabane</option>
<option value="Africa/Mogadishu">Africa/Mogadishu</option>
<option value="Africa/Monrovia">Africa/Monrovia</option>
<option value="Africa/Nairobi">Africa/Nairobi</option>
<option value="Africa/Ndjamena">Africa/Ndjamena</option>
<option value="Africa/Niamey">Africa/Niamey</option>
<option value="Africa/Nouakchott">Africa/Nouakchott</option>
<option value="Africa/Ouagadougou">Africa/Ouagadougou</option>
<option value="Africa/Porto-Novo">Africa/Porto-Novo</option>
<option value="Africa/Sao_Tome">Africa/Sao_Tome</option>
<option value="Africa/Tripoli">Africa/Tripoli</option>
<option value="Africa/Tunis">Africa/Tunis</option>
<option value="Africa/Windhoek">Africa/Windhoek</option>
<option value="America/Adak">America/Adak</option>
<option value="America/Anchorage">America/Anchorage</option>
<option value="America/Anguilla">America/Anguilla</option>
<option value="America/Antigua">America/Antigua</option>
<option value="America/Araguaina">America/Araguaina</option>
<option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
<option value="America/Argentina/Catamarca">America/Argentina/Catamarca</option>
<option value="America/Argentina/Cordoba">America/Argentina/Cordoba</option>
<option value="America/Argentina/Jujuy">America/Argentina/Jujuy</option>
<option value="America/Argentina/La_Rioja">America/Argentina/La_Rioja</option>
<option value="America/Argentina/Mendoza">America/Argentina/Mendoza</option>
<option value="America/Argentina/Rio_Gallegos">America/Argentina/Rio_Gallegos</option>
<option value="America/Argentina/Salta">America/Argentina/Salta</option>
<option value="America/Argentina/San_Juan">America/Argentina/San_Juan</option>
<option value="America/Argentina/San_Luis">America/Argentina/San_Luis</option>
<option value="America/Argentina/Tucuman">America/Argentina/Tucuman</option>
<option value="America/Argentina/Ushuaia">America/Argentina/Ushuaia</option>
<option value="America/Aruba">America/Aruba</option>
<option value="America/Asuncion">America/Asuncion</option>
<option value="America/Atikokan">America/Atikokan</option>
<option value="America/Bahia">America/Bahia</option>
<option value="America/Bahia_Banderas">America/Bahia_Banderas</option>
<option value="America/Barbados">America/Barbados</option>
<option value="America/Belem">America/Belem</option>
<option value="America/Belize">America/Belize</option>
<option value="America/Blanc-Sablon">America/Blanc-Sablon</option>
<option value="America/Boa_Vista">America/Boa_Vista</option>
<option value="America/Bogota">America/Bogota</option>
<option value="America/Boise">America/Boise</option>
<option value="America/Cambridge_Bay">America/Cambridge_Bay</option>
<option value="America/Campo_Grande">America/Campo_Grande</option>
<option value="America/Cancun">America/Cancun</option>
<option value="America/Caracas">America/Caracas</option>
<option value="America/Cayenne">America/Cayenne</option>
<option value="America/Cayman">America/Cayman</option>
<option value="America/Chicago">America/Chicago</option>
<option value="America/Chihuahua">America/Chihuahua</option>
<option value="America/Costa_Rica">America/Costa_Rica</option>
<option value="America/Creston">America/Creston</option>
<option value="America/Cuiaba">America/Cuiaba</option>
<option value="America/Curacao">America/Curacao</option>
<option value="America/Danmarkshavn">America/Danmarkshavn</option>
<option value="America/Dawson">America/Dawson</option>
<option value="America/Dawson_Creek">America/Dawson_Creek</option>
<option value="America/Denver">America/Denver</option>
<option value="America/Detroit">America/Detroit</option>
<option value="America/Dominica">America/Dominica</option>
<option value="America/Edmonton">America/Edmonton</option>
<option value="America/Eirunepe">America/Eirunepe</option>
<option value="America/El_Salvador">America/El_Salvador</option>
<option value="America/Fort_Nelson">America/Fort_Nelson</option>
<option value="America/Fortaleza">America/Fortaleza</option>
<option value="America/Glace_Bay">America/Glace_Bay</option>
<option value="America/Godthab">America/Godthab</option>
<option value="America/Goose_Bay">America/Goose_Bay</option>
<option value="America/Grand_Turk">America/Grand_Turk</option>
<option value="America/Grenada">America/Grenada</option>
<option value="America/Guadeloupe">America/Guadeloupe</option>
<option value="America/Guatemala">America/Guatemala</option>
<option value="America/Guayaquil">America/Guayaquil</option>
<option value="America/Guyana">America/Guyana</option>
<option value="America/Halifax">America/Halifax</option>
<option value="America/Havana">America/Havana</option>
<option value="America/Hermosillo">America/Hermosillo</option>
<option value="America/Indiana/Indianapolis">America/Indiana/Indianapolis</option>
<option value="America/Indiana/Knox">America/Indiana/Knox</option>
<option value="America/Indiana/Marengo">America/Indiana/Marengo</option>
<option value="America/Indiana/Petersburg">America/Indiana/Petersburg</option>
<option value="America/Indiana/Tell_City">America/Indiana/Tell_City</option>
<option value="America/Indiana/Vevay">America/Indiana/Vevay</option>
<option value="America/Indiana/Vincennes">America/Indiana/Vincennes</option>
<option value="America/Indiana/Winamac">America/Indiana/Winamac</option>
<option value="America/Inuvik">America/Inuvik</option>
<option value="America/Iqaluit">America/Iqaluit</option>
<option value="America/Jamaica">America/Jamaica</option>
<option value="America/Juneau">America/Juneau</option>
<option value="America/Kentucky/Louisville">America/Kentucky/Louisville</option>
<option value="America/Kentucky/Monticello">America/Kentucky/Monticello</option>
<option value="America/Kralendijk">America/Kralendijk</option>
<option value="America/La_Paz">America/La_Paz</option>
<option value="America/Lima">America/Lima</option>
<option value="America/Los_Angeles">America/Los_Angeles</option>
<option value="America/Lower_Princes">America/Lower_Princes</option>
<option value="America/Maceio">America/Maceio</option>
<option value="America/Managua">America/Managua</option>
<option value="America/Manaus">America/Manaus</option>
<option value="America/Marigot">America/Marigot</option>
<option value="America/Martinique">America/Martinique</option>
<option value="America/Matamoros">America/Matamoros</option>
<option value="America/Mazatlan">America/Mazatlan</option>
<option value="America/Menominee">America/Menominee</option>
<option value="America/Merida">America/Merida</option>
<option value="America/Metlakatla">America/Metlakatla</option>
<option value="America/Mexico_City">America/Mexico_City</option>
<option value="America/Miquelon">America/Miquelon</option>
<option value="America/Moncton">America/Moncton</option>
<option value="America/Monterrey">America/Monterrey</option>
<option value="America/Montevideo">America/Montevideo</option>
<option value="America/Montserrat">America/Montserrat</option>
<option value="America/Nassau">America/Nassau</option>
<option value="America/New_York">America/New_York</option>
<option value="America/Nipigon">America/Nipigon</option>
<option value="America/Nome">America/Nome</option>
<option value="America/Noronha">America/Noronha</option>
<option value="America/North_Dakota/Beulah">America/North_Dakota/Beulah</option>
<option value="America/North_Dakota/Center">America/North_Dakota/Center</option>
<option value="America/North_Dakota/New_Salem">America/North_Dakota/New_Salem</option>
<option value="America/Ojinaga">America/Ojinaga</option>
<option value="America/Panama">America/Panama</option>
<option value="America/Pangnirtung">America/Pangnirtung</option>
<option value="America/Paramaribo">America/Paramaribo</option>
<option value="America/Phoenix">America/Phoenix</option>
<option value="America/Port-au-Prince">America/Port-au-Prince</option>
<option value="America/Port_of_Spain">America/Port_of_Spain</option>
<option value="America/Porto_Velho">America/Porto_Velho</option>
<option value="America/Puerto_Rico">America/Puerto_Rico</option>
<option value="America/Rainy_River">America/Rainy_River</option>
<option value="America/Rankin_Inlet">America/Rankin_Inlet</option>
<option value="America/Recife">America/Recife</option>
<option value="America/Regina">America/Regina</option>
<option value="America/Resolute">America/Resolute</option>
<option value="America/Rio_Branco">America/Rio_Branco</option>
<option value="America/Santarem">America/Santarem</option>
<option value="America/Santiago">America/Santiago</option>
<option value="America/Santo_Domingo">America/Santo_Domingo</option>
<option value="America/Sao_Paulo">America/Sao_Paulo</option>
<option value="America/Scoresbysund">America/Scoresbysund</option>
<option value="America/Sitka">America/Sitka</option>
<option value="America/St_Barthelemy">America/St_Barthelemy</option>
<option value="America/St_Johns">America/St_Johns</option>
<option value="America/St_Kitts">America/St_Kitts</option>
<option value="America/St_Lucia">America/St_Lucia</option>
<option value="America/St_Thomas">America/St_Thomas</option>
<option value="America/St_Vincent">America/St_Vincent</option>
<option value="America/Swift_Current">America/Swift_Current</option>
<option value="America/Tegucigalpa">America/Tegucigalpa</option>
<option value="America/Thule">America/Thule</option>
<option value="America/Thunder_Bay">America/Thunder_Bay</option>
<option value="America/Tijuana">America/Tijuana</option>
<option value="America/Toronto">America/Toronto</option>
<option value="America/Tortola">America/Tortola</option>
<option value="America/Vancouver">America/Vancouver</option>
<option value="America/Whitehorse">America/Whitehorse</option>
<option value="America/Winnipeg">America/Winnipeg</option>
<option value="America/Yakutat">America/Yakutat</option>
<option value="America/Yellowknife">America/Yellowknife</option>
<option value="Antarctica/Casey">Antarctica/Casey</option>
<option value="Antarctica/Davis">Antarctica/Davis</option>
<option value="Antarctica/DumontDUrville">Antarctica/DumontDUrville</option>
<option value="Antarctica/Macquarie">Antarctica/Macquarie</option>
<option value="Antarctica/Mawson">Antarctica/Mawson</option>
<option value="Antarctica/McMurdo">Antarctica/McMurdo</option>
<option value="Antarctica/Palmer">Antarctica/Palmer</option>
<option value="Antarctica/Rothera">Antarctica/Rothera</option>
<option value="Antarctica/Syowa">Antarctica/Syowa</option>
<option value="Antarctica/Troll">Antarctica/Troll</option>
<option value="Antarctica/Vostok">Antarctica/Vostok</option>
<option value="Arctic/Longyearbyen">Arctic/Longyearbyen</option>
<option value="Asia/Aden">Asia/Aden</option>
<option value="Asia/Almaty">Asia/Almaty</option>
<option value="Asia/Amman">Asia/Amman</option>
<option value="Asia/Anadyr">Asia/Anadyr</option>
<option value="Asia/Aqtau">Asia/Aqtau</option>
<option value="Asia/Aqtobe">Asia/Aqtobe</option>
<option value="Asia/Ashgabat">Asia/Ashgabat</option>
<option value="Asia/Atyrau">Asia/Atyrau</option>
<option value="Asia/Baghdad">Asia/Baghdad</option>
<option value="Asia/Bahrain">Asia/Bahrain</option>
<option value="Asia/Baku">Asia/Baku</option>
<option value="Asia/Bangkok">Asia/Bangkok</option>
<option value="Asia/Barnaul">Asia/Barnaul</option>
<option value="Asia/Beirut">Asia/Beirut</option>
<option value="Asia/Bishkek">Asia/Bishkek</option>
<option value="Asia/Brunei">Asia/Brunei</option>
<option value="Asia/Chita">Asia/Chita</option>
<option value="Asia/Choibalsan">Asia/Choibalsan</option>
<option value="Asia/Colombo">Asia/Colombo</option>
<option value="Asia/Damascus">Asia/Damascus</option>
<option value="Asia/Dhaka">Asia/Dhaka</option>
<option value="Asia/Dili">Asia/Dili</option>
<option value="Asia/Dubai">Asia/Dubai</option>
<option value="Asia/Dushanbe">Asia/Dushanbe</option>
<option value="Asia/Famagusta">Asia/Famagusta</option>
<option value="Asia/Gaza">Asia/Gaza</option>
<option value="Asia/Hebron">Asia/Hebron</option>
<option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
<option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
<option value="Asia/Hovd">Asia/Hovd</option>
<option value="Asia/Irkutsk">Asia/Irkutsk</option>
<option value="Asia/Jakarta">Asia/Jakarta</option>
<option value="Asia/Jayapura">Asia/Jayapura</option>
<option value="Asia/Jerusalem">Asia/Jerusalem</option>
<option value="Asia/Kabul">Asia/Kabul</option>
<option value="Asia/Kamchatka">Asia/Kamchatka</option>
<option value="Asia/Karachi">Asia/Karachi</option>
<option value="Asia/Kathmandu">Asia/Kathmandu</option>
<option value="Asia/Khandyga">Asia/Khandyga</option>
<option value="Asia/Kolkata">Asia/Kolkata</option>
<option value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</option>
<option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
<option value="Asia/Kuching">Asia/Kuching</option>
<option value="Asia/Kuwait">Asia/Kuwait</option>
<option value="Asia/Macau">Asia/Macau</option>
<option value="Asia/Magadan">Asia/Magadan</option>
<option value="Asia/Makassar">Asia/Makassar</option>
<option value="Asia/Manila">Asia/Manila</option>
<option value="Asia/Muscat">Asia/Muscat</option>
<option value="Asia/Nicosia">Asia/Nicosia</option>
<option value="Asia/Novokuznetsk">Asia/Novokuznetsk</option>
<option value="Asia/Novosibirsk">Asia/Novosibirsk</option>
<option value="Asia/Omsk">Asia/Omsk</option>
<option value="Asia/Oral">Asia/Oral</option>
<option value="Asia/Phnom_Penh">Asia/Phnom_Penh</option>
<option value="Asia/Pontianak">Asia/Pontianak</option>
<option value="Asia/Pyongyang">Asia/Pyongyang</option>
<option value="Asia/Qatar">Asia/Qatar</option>
<option value="Asia/Qyzylorda">Asia/Qyzylorda</option>
<option value="Asia/Riyadh">Asia/Riyadh</option>
<option value="Asia/Sakhalin">Asia/Sakhalin</option>
<option value="Asia/Samarkand">Asia/Samarkand</option>
<option value="Asia/Seoul">Asia/Seoul</option>
<option value="Asia/Shanghai">Asia/Shanghai</option>
<option value="Asia/Singapore">Asia/Singapore</option>
<option value="Asia/Srednekolymsk">Asia/Srednekolymsk</option>
<option value="Asia/Taipei">Asia/Taipei</option>
<option value="Asia/Tashkent">Asia/Tashkent</option>
<option value="Asia/Tbilisi">Asia/Tbilisi</option>
<option value="Asia/Tehran">Asia/Tehran</option>
<option value="Asia/Thimphu">Asia/Thimphu</option>
<option value="Asia/Tokyo">Asia/Tokyo</option>
<option value="Asia/Tomsk">Asia/Tomsk</option>
<option value="Asia/Ulaanbaatar">Asia/Ulaanbaatar</option>
<option value="Asia/Urumqi">Asia/Urumqi</option>
<option value="Asia/Ust-Nera">Asia/Ust-Nera</option>
<option value="Asia/Vientiane">Asia/Vientiane</option>
<option value="Asia/Vladivostok">Asia/Vladivostok</option>
<option value="Asia/Yakutsk">Asia/Yakutsk</option>
<option value="Asia/Yangon">Asia/Yangon</option>
<option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option>
<option value="Asia/Yerevan">Asia/Yerevan</option>
<option value="Atlantic/Azores">Atlantic/Azores</option>
<option value="Atlantic/Bermuda">Atlantic/Bermuda</option>
<option value="Atlantic/Canary">Atlantic/Canary</option>
<option value="Atlantic/Cape_Verde">Atlantic/Cape_Verde</option>
<option value="Atlantic/Faroe">Atlantic/Faroe</option>
<option value="Atlantic/Madeira">Atlantic/Madeira</option>
<option value="Atlantic/Reykjavik">Atlantic/Reykjavik</option>
<option value="Atlantic/South_Georgia">Atlantic/South_Georgia</option>
<option value="Atlantic/St_Helena">Atlantic/St_Helena</option>
<option value="Atlantic/Stanley">Atlantic/Stanley</option>
<option value="Australia/Adelaide">Australia/Adelaide</option>
<option value="Australia/Brisbane">Australia/Brisbane</option>
<option value="Australia/Broken_Hill">Australia/Broken_Hill</option>
<option value="Australia/Currie">Australia/Currie</option>
<option value="Australia/Darwin">Australia/Darwin</option>
<option value="Australia/Eucla">Australia/Eucla</option>
<option value="Australia/Hobart">Australia/Hobart</option>
<option value="Australia/Lindeman">Australia/Lindeman</option>
<option value="Australia/Lord_Howe">Australia/Lord_Howe</option>
<option value="Australia/Melbourne">Australia/Melbourne</option>
<option value="Australia/Perth">Australia/Perth</option>
<option value="Australia/Sydney">Australia/Sydney</option>
<option value="Europe/Amsterdam">Europe/Amsterdam</option>
<option value="Europe/Andorra">Europe/Andorra</option>
<option value="Europe/Astrakhan">Europe/Astrakhan</option>
<option value="Europe/Athens">Europe/Athens</option>
<option value="Europe/Belgrade">Europe/Belgrade</option>
<option value="Europe/Berlin">Europe/Berlin</option>
<option value="Europe/Bratislava">Europe/Bratislava</option>
<option value="Europe/Brussels">Europe/Brussels</option>
<option value="Europe/Bucharest">Europe/Bucharest</option>
<option value="Europe/Budapest">Europe/Budapest</option>
<option value="Europe/Busingen">Europe/Busingen</option>
<option value="Europe/Chisinau">Europe/Chisinau</option>
<option value="Europe/Copenhagen">Europe/Copenhagen</option>
<option value="Europe/Dublin">Europe/Dublin</option>
<option value="Europe/Gibraltar">Europe/Gibraltar</option>
<option value="Europe/Guernsey">Europe/Guernsey</option>
<option value="Europe/Helsinki">Europe/Helsinki</option>
<option value="Europe/Isle_of_Man">Europe/Isle_of_Man</option>
<option value="Europe/Istanbul">Europe/Istanbul</option>
<option value="Europe/Jersey">Europe/Jersey</option>
<option value="Europe/Kaliningrad">Europe/Kaliningrad</option>
<option value="Europe/Kiev">Europe/Kiev</option>
<option value="Europe/Kirov">Europe/Kirov</option>
<option value="Europe/Lisbon">Europe/Lisbon</option>
<option value="Europe/Ljubljana">Europe/Ljubljana</option>
<option value="Europe/London">Europe/London</option>
<option value="Europe/Luxembourg">Europe/Luxembourg</option>
<option value="Europe/Madrid">Europe/Madrid</option>
<option value="Europe/Malta">Europe/Malta</option>
<option value="Europe/Mariehamn">Europe/Mariehamn</option>
<option value="Europe/Minsk">Europe/Minsk</option>
<option value="Europe/Monaco">Europe/Monaco</option>
<option value="Europe/Moscow">Europe/Moscow</option>
<option value="Europe/Oslo">Europe/Oslo</option>
<option value="Europe/Paris">Europe/Paris</option>
<option value="Europe/Podgorica">Europe/Podgorica</option>
<option value="Europe/Prague">Europe/Prague</option>
<option value="Europe/Riga">Europe/Riga</option>
<option value="Europe/Rome">Europe/Rome</option>
<option value="Europe/Samara">Europe/Samara</option>
<option value="Europe/San_Marino">Europe/San_Marino</option>
<option value="Europe/Sarajevo">Europe/Sarajevo</option>
<option value="Europe/Saratov">Europe/Saratov</option>
<option value="Europe/Simferopol">Europe/Simferopol</option>
<option value="Europe/Skopje">Europe/Skopje</option>
<option value="Europe/Sofia">Europe/Sofia</option>
<option value="Europe/Stockholm">Europe/Stockholm</option>
<option value="Europe/Tallinn">Europe/Tallinn</option>
<option value="Europe/Tirane">Europe/Tirane</option>
<option value="Europe/Ulyanovsk">Europe/Ulyanovsk</option>
<option value="Europe/Uzhgorod">Europe/Uzhgorod</option>
<option value="Europe/Vaduz">Europe/Vaduz</option>
<option value="Europe/Vatican">Europe/Vatican</option>
<option value="Europe/Vienna">Europe/Vienna</option>
<option value="Europe/Vilnius">Europe/Vilnius</option>
<option value="Europe/Volgograd">Europe/Volgograd</option>
<option value="Europe/Warsaw">Europe/Warsaw</option>
<option value="Europe/Zagreb">Europe/Zagreb</option>
<option value="Europe/Zaporozhye">Europe/Zaporozhye</option>
<option value="Europe/Zurich">Europe/Zurich</option>
<option value="Indian/Antananarivo">Indian/Antananarivo</option>
<option value="Indian/Chagos">Indian/Chagos</option>
<option value="Indian/Christmas">Indian/Christmas</option>
<option value="Indian/Cocos">Indian/Cocos</option>
<option value="Indian/Comoro">Indian/Comoro</option>
<option value="Indian/Kerguelen">Indian/Kerguelen</option>
<option value="Indian/Mahe">Indian/Mahe</option>
<option value="Indian/Maldives">Indian/Maldives</option>
<option value="Indian/Mauritius">Indian/Mauritius</option>
<option value="Indian/Mayotte">Indian/Mayotte</option>
<option value="Indian/Reunion">Indian/Reunion</option>
<option value="Pacific/Apia">Pacific/Apia</option>
<option value="Pacific/Auckland">Pacific/Auckland</option>
<option value="Pacific/Bougainville">Pacific/Bougainville</option>
<option value="Pacific/Chatham">Pacific/Chatham</option>
<option value="Pacific/Chuuk">Pacific/Chuuk</option>
<option value="Pacific/Easter">Pacific/Easter</option>
<option value="Pacific/Efate">Pacific/Efate</option>
<option value="Pacific/Enderbury">Pacific/Enderbury</option>
<option value="Pacific/Fakaofo">Pacific/Fakaofo</option>
<option value="Pacific/Fiji">Pacific/Fiji</option>
<option value="Pacific/Funafuti">Pacific/Funafuti</option>
<option value="Pacific/Galapagos">Pacific/Galapagos</option>
<option value="Pacific/Gambier">Pacific/Gambier</option>
<option value="Pacific/Guadalcanal">Pacific/Guadalcanal</option>
<option value="Pacific/Guam">Pacific/Guam</option>
<option value="Pacific/Honolulu">Pacific/Honolulu</option>
<option value="Pacific/Johnston">Pacific/Johnston</option>
<option value="Pacific/Kiritimati">Pacific/Kiritimati</option>
<option value="Pacific/Kosrae">Pacific/Kosrae</option>
<option value="Pacific/Kwajalein">Pacific/Kwajalein</option>
<option value="Pacific/Majuro">Pacific/Majuro</option>
<option value="Pacific/Marquesas">Pacific/Marquesas</option>
<option value="Pacific/Midway">Pacific/Midway</option>
<option value="Pacific/Nauru">Pacific/Nauru</option>
<option value="Pacific/Niue">Pacific/Niue</option>
<option value="Pacific/Norfolk">Pacific/Norfolk</option>
<option value="Pacific/Noumea">Pacific/Noumea</option>
<option value="Pacific/Pago_Pago">Pacific/Pago_Pago</option>
<option value="Pacific/Palau">Pacific/Palau</option>
<option value="Pacific/Pitcairn">Pacific/Pitcairn</option>
<option value="Pacific/Pohnpei">Pacific/Pohnpei</option>
<option value="Pacific/Port_Moresby">Pacific/Port_Moresby</option>
<option value="Pacific/Rarotonga">Pacific/Rarotonga</option>
<option value="Pacific/Saipan">Pacific/Saipan</option>
<option value="Pacific/Tahiti">Pacific/Tahiti</option>
<option value="Pacific/Tarawa">Pacific/Tarawa</option>
<option value="Pacific/Tongatapu">Pacific/Tongatapu</option>
<option value="Pacific/Wake">Pacific/Wake</option>
<option value="Pacific/Wallis">Pacific/Wallis</option>`


window.updateOne = updateOne;
window.acceptOne = acceptOne;
window.refuseOne = refuseOne;
window.updateArchive = updateArchive;
window.addNote = addNote;







document.querySelectorAll('.pull-rebuild a').forEach(el => {
    el.addEventListener('click', function () {
        document.querySelector('#loader').style.display = "flex";
    })
})

async function addNote(id, el) {
    let newMessage = `<div class="msg note"><p class="meta"><time>just now</time> <span>note</span></p><p class="message">${el.closest('li').querySelector(".noteToAdd").value}</div>`

    axios
        .post(`${config.server}/${config.apiEventsUpdate}/`, {
            "needs": el.closest('li').querySelector(".noteToAdd").value,
            "name": `open publishing fest`,
            "email": `adam@coko.foundation`,
            "eventid": id
        }).catch(e => {
            console.log(`error`, e)
        })

    el.closest('li').querySelector('.updates').insertAdjacentHTML('beforeend', newMessage);
    // el.closest('li').querySelector(".noteToAdd").innerHTML == "";


}




// .archivedUpdate

