Template.intro.rendered = function () {
    //code is from http://codepen.io/anon/pen/wBBqxB

    var slider = (function () {

        var $slideshow = $('#slideshow'),
            $items = $slideshow.children('li'),
            itemsCount = $items.length,
            $controls = $('#controls'),
            navigation = {
                $navPrev: $controls.find('span.prev'),
                $navNext: $controls.find('span.next')
            },
            current = 0,
            isSlideshowActive = true,
            slideshowtime,
            interval = 7500;

        function init() {
            TweenLite.set($items.filter(":gt(0)"), {
                autoAlpha: 0
            });
            initEvents();
            startSlideshow();
        }
//        Creates the events of the buttons, in this case they are click events
        function initEvents() {
            startSlideshow();

            navigation.$navPrev.on('click', function () {
                navigate('prev');
                if (isSlideshowActive) {
                    startSlideshow();
                }
            });

            navigation.$navNext.on('click', function () {
                navigate('next');
                if (isSlideshowActive) {
                    startSlideshow();
                }
            });
        }

        function navigate(direction) {

            var $oldItem = $items.eq(current);

            if (direction === 'next') {
                if (current !== 2) {
                    current = current < itemsCount - 1 ? ++current : 0;
                }

            } else if (direction === 'prev') {
                if (current !== 0) {
                    current = current > 0 ? --current : itemsCount - 1;
                }
            }

            var $newItem = $items.eq(current);

            TweenLite.to($oldItem, 1, {
                autoAlpha: 0
            });
            TweenLite.to($newItem, 1, {
                autoAlpha: 1
            });

        }

//        Starts the slideshow and runs based on a given interval
        function startSlideshow() {
            isSlideshowActive = true;
            clearTimeout(slideshowtime);
            slideshowtime = setTimeout(function () {
                navigate('next');
                startSlideshow();
            }, interval);
        }

        return {
            init: init
        };

    })();

//    Executes the slider function created above
    $(function () {
        slider.init();
    });
}
