import axios from "axios";
import config from "./config.js"





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
            data[currentElement.name] = currentElement.value;

        }
        const stringdata = data;
        console.log(...formContent);
        console.log(stringdata);
        formContent.append("data", JSON.stringify(stringdata));
        formContent.delete("enrico");

        

        axios
            .post(`${config.server}/${config.apiEventsUpdate}/`, formContent, {
                onUploadProgress: event => {
                    console.log(event.loaded, event.total);
                    document.querySelector("section.content").innerHTML = `<p class="event-loading">${Math.floor(event.loaded / event.total * 100)}%</p>`
                    if (event.loaded == event.total) {
                        document.querySelector("section.content").innerHTML = "Please wait while we’re uploading your submission to our servers."
                    }
                }
            })
            .then(function (response) {
                document.querySelector("section.content").innerHTML = '<p class="thanks">Thanks for your message, we’ll contact you very soon!</p>';
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


function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const emailZone = document.querySelector('input[type="email"]');
//   document.querySelector('input[type="email"]').addEventListener('change', emailIsValid(document.querySelector('input[type="email"]').value));

emailZone.addEventListener("change", console.log('change'));
