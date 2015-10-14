Template.home.rendered = function () {

    var homepage = document.querySelectorAll('.homepage');
    TweenMax.from(homepage, 2, {
        opacity: 0,
        y: 100
    });
}
