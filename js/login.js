document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form from submitting normally

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Hardcoded credentials
        const validUsername = "user";
        const validPassword = "pass";

        if (username === validUsername && password === validPassword) {

            // Store authentication status
            localStorage.setItem("authenticated", "true");

            // Redirect to index.html
            window.location.href = "index2.html";
        } else {
            alert("Invalid username or password.");
        }
    });
});