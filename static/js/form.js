import axios from "axios";
import config from "./config.js"




// setup standard localtime and time zones for the form
const localDate = Intl.DateTimeFormat().resolvedOptions().timeZone
const selector = document.querySelector('#timezoneSelect')

selector.querySelectorAll('option').forEach(zn => {
    if (zn.value === localDate) { zn.setAttribute('selected', 'selected') }
})

// set up form
const formElement = document.querySelector('#form');

formElement.addEventListener("submit", e => {

    e.preventDefault();

    const formElements = formElement.elements;
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

                else if (currentElement.type == "radio" && currentElement.checked == true ) {
                    // currentElement.value = new Boolean(currentElement.value.replace(`"`, ``));
                    console.log('checked', currentElement);
                    data[currentElement.name] = currentElement.value;
                }
                else if (currentElement.type === 'file') {
                    for (let i = 0; i < currentElement.files.length; i++) {
                        const file = currentElement.files[i];

                    }
                }

                else if (currentElement.type == "radio" && currentElement.checked == false) {
                    // do nothing
                    console.log('notChecked:', currentElement)
                } else {
                    data[currentElement.name] = currentElement.value;
                }
            }

        }
        const stringdata = data;
        console.log(...formContent);
        console.log(stringdata);
        formContent.append("data", JSON.stringify(stringdata));
        formContent.delete("enrico");


        axios
            .post(`${config.server}/${config.apiEvents}/`, formContent, {
                onUploadProgress: event => {
                    console.log(event.loaded, event.total);
                    document.querySelector("section.content").innerHTML = `<p class="event-loading">${Math.floor(event.loaded / event.total * 100)}%</p>`
                    if (event.loaded == event.total) {
                        document.querySelector("section.content").innerHTML = "Please wait while we’re uploading your submission to our servers."
                    }
                }
            })
            .then(function (response) {
                document.querySelector("section.content").innerHTML = '<p class="thanks">Thanks for your proposal, we’ll contact you soon!</p>';
            })
            .catch(error => {
                console.log(error);

                document.querySelector("section.content").innerHTML = `
                <p class="thanks">An error occured:  ${error}</p>
                <p class="thanks">There has been an error while uploading your form, please contact <a href="mailto:${config.adminEmail}">${config.adminEmail}</a>. or <a href="/form/index.html">try again</a>.</p>`;
                scrollTo(document.querySelector("section.content"));
            });

    }

});

var imagesInput = document.querySelector("#images");
if (imagesInput) {
    imagesInput.addEventListener("change", function () {

        var filesize = document.querySelector('input[type="file"]').files[0].size;
        if (filesize > 2000000) {
            this.value = "";
            alert("images must be 2mb maximum");
        }

    })
}

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const emailZone = document.querySelector('input[type="email"]');
//   document.querySelector('input[type="email"]').addEventListener('change', emailIsValid(document.querySelector('input[type="email"]').value));

emailZone.addEventListener("change", console.log('change'));
