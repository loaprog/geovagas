document.getElementById("toggle-dark").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    
    const logo = document.querySelector(".logo");
    const mobileLogo = document.querySelector(".mobile-logo");
    const isDarkMode = document.body.classList.contains("dark-mode");
    
    logo.src = isDarkMode 
        ? "../static/wp-content/uploads/2024/04/mobile2.png"
        : "../static/wp-content/uploads/2024/04/mobile1.png";
        
    mobileLogo.src = isDarkMode 
        ? "../static/wp-content/uploads/2024/04/mobile2.png"
        : "../static/wp-content/uploads/2024/04/mobile1.png";
});

document.getElementById('menu-toggle').addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('active');
});


