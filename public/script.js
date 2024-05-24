// Select all anchor tags on the page
let userInbox = document.querySelectorAll("a");

// Select the element with class 'username'
let r = document.querySelector('.username');

// Select all elements with class 'user'
let u = document.querySelectorAll('.user');

// Get the current URL
let cu = `${window.location.href}`;

// Split the URL at '?q=' to avoid appending it multiple queries
let w = cu.split("?q=");
let str;

// Loop over each 'user' element
u.forEach((element) => {
    // Get the id of the current 'user' element
    str = element.id;

    //acccesing anchor tag which is child of element
    let ch = element.childNodes[1]
    // console.log(ch)
    // Construct the new URL
    ch.href = `${w[0]}?q=${str}`;

})

// Select the element with class 'contain'
let cb = document.querySelector('.contain')

// Add an event listener for the 'DOMContentLoaded' event
window.addEventListener("DOMContentLoaded", () => {
    // Scroll to the bottom of the 'contain' element
    cb.scrollTop = cb.scrollHeight
})

