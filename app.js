const menu = document.querySelector('#mobile-menu')
const menuLinks = document.querySelector('.navbar__menu')

menu.addEventListener('click', function() {
    menu.classList.toggle('isactive');
    menuLinks.classList.toggle('active');
})

document.addEventListener('DOMContentLoaded', function () {
    const aboutSection = document.querySelector('#about');
    const aboutPic = document.querySelector('.about__pic');

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function handleScroll() {
        if (isInViewport(aboutSection)) {
            aboutPic.classList.add('animate');
        }
    }

    // Handle scroll events
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();
});