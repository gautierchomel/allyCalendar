import axios from "axios";
import SlimSelect from "slim-select";
import config from "./config.js"


// set up form
const formElement = document.querySelector('#form');



formElement.addEventListener("submit", e => {


    e.preventDefault();

    const participantOK = document.createElement("input");
    participantOK.setAttribute("name", "events");
    participantOK.value = select.selected().join(",");
    formElement.insertAdjacentElement("beforeend", participantOK);

    const formElements = formElement.elements;
    ('formElements', formElements);

    const honey = document.querySelector(".nah");
    if (honey.value == "") {

        const formContent = new FormData(formElement);

        const data = {};

        for (let i = 0; i < formElements.length; i++) {

            const currentElement = formElements[i];

            if (!['submit', 'file'].includes(currentElement.type) && currentElement.name != "enrico") {
                if (currentElement.name == "time" && currentElement.value.indexOf(':00.000') <= -1) {
                    currentElement.value = currentElement.value + ':00.000'
                    data[currentElement.name] = currentElement.value;
                }

                else if (currentElement.type == "radio" && currentElement.checked) {
                    currentElement.value = currentElement.value.replace(`"`, ``);
                    currentElement.value = new Boolean(currentElement.value);
                    data[currentElement.name] = currentElement.value;
                }
                else if (currentElement.type === 'file') {
                    for (let i = 0; i < currentElement.files.length; i++) {
                        const file = currentElement.files[i];
                    }
                }

                else if (currentElement.type == "radio" && !currentElement.checked) {
                    // do nothing
                } else {
                    data[currentElement.name] = currentElement.value;
                }
            }
        }

        console.log(...formContent);

        formContent.append("data", JSON.stringify(data));

        formContent.delete("enrico");


        axios
            .post(`${config.server}/${config.apiParticipants}`, formContent, {
                onUploadProgress: event => {
                    document.querySelector("section.content").innerHTML = `<p class="event-loading">${Math.floor(event.loaded / event.total * 100)}%</p>`
                    if (event.loaded == event.total) {
                        document.querySelector("section.content").innerHTML = "Please wait while we’re uploading your submission to our servers."
                    }
                }
            })
            .then(function (response) {

                document.querySelector("section.content").innerHTML = '<p class="thanks">Welcome to the band! We’ll add your name to the list.</p>';
            })
            .catch(error => {
                console.log(error);
                document.querySelector("section.content").innerHTML = `
                <p class="thanks">An error occured:  ${error}</p>
                <p class="thanks">There has been an error while uploading your form, please contact <a href="mailto:${config.adminName}">${config.adminEmail}</a>. or <a href="participant.html">try again</a>.</p>`;
                scrollTo(document.querySelector("section.content"));
            });

    }

});





document.querySelector("#images").addEventListener("change", function () {

    var filesize = document.querySelector('input[type="file"]').files[0].size;
    if (filesize > 2000000) {
        this.value = "";
        alert("images must be 2mb maximum");
    }

    console.log(filesize);
}
)

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}



const emailZone = document.querySelector('input[type="email"]');
//   document.querySelector('input[type="email"]').addEventListener('change', emailIsValid(document.querySelector('input[type="email"]').value));

// emailZone.addEventListener("change", console.log('change'));



function compareStrings(a, b) {
    // Assuming you want case-insensitive comparison
    a = a.toLowerCase();
    b = b.toLowerCase();

    return (a < b) ? -1 : (a > b) ? 1 : 0;
}
var select = new SlimSelect({
    select: '#chosenEvents'
});


// max text for textarea
function maxText(el) {
    if (el.getAttribute("maxlength")) {
        var max = el.getAttribute("maxlength");
        var len = el.value.length;
        var char = max - len;
        el.closest("label").querySelector(".counter").innerHTML = `${len}/${max}`;
    }
}


var txts = document.getElementsByTagName('TEXTAREA');

for (var i = 0, l = txts.length; i < l; i++) {
    if (/^[0-9]+$/.test(txts[i].getAttribute("maxlength"))) {
        var func = function () {
            var len = parseInt(this.getAttribute("maxlength"), 10);

            if (this.value.length > len) {
                alert('Maximum length exceeded: ' + len);
                this.value = this.value.substr(0, len);
                return false;
            }
            maxText(this);

        }

        txts[i].onkeyup = func;
        txts[i].onblur = func;
    }
};



document.querySelector("#mail").addEventListener("change", function () {
    if (!emailIsValid(this.value)) {
        alert('There is a problem with your email adress. It should look like this: awesome@something.com')
    }
});