// if no js show everything, else: 

document.querySelectorAll(".participant").forEach(el=> {el. classList.remove("active")
});
document.querySelector(".button").classList.remove("hide");

// show people
document.querySelectorAll(".participant").forEach(
    el => {
        el.addEventListener("click", () => {el.classList.toggle("active")});
    }
)




document.querySelector("input#search").addEventListener("keyup", function () {
    searchAnEvent(this);
});


function searchAnEvent(input) {

    // const input = document.querySelector('#search');
    let filter = input.value.toUpperCase();
    let eventList = document.querySelector("#participants").querySelectorAll('.participant');

    // Loop through all list items, and hide those who don't match the search query
    eventList.forEach(event => {
        let txtValue = event.textContent.toUpperCase() || event.innerText.toUpperCase();
        if (txtValue.indexOf(filter) > -1) {
            event.style.display = "";
        } else {
            event.style.display = "none";
        }
    })
}

// https://stackoverflow.com/questions/25175798/how-to-shuffle-a-nodelist


var list = document.querySelector('#participants'), i;
for (i = list.children.length; i >= 0; i--) {
console.log(`i`, i)

    list.appendChild(list.children[Math.random() * i | 0]);
}
