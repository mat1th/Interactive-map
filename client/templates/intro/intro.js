Template.intro.rendered = function () {
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

        function startSlideshow() {
            // Help Here
            isSlideshowActive = true;
            clearTimeout(slideshowtime);
            slideshowtime = setTimeout(function () {
                navigate('next');
                startSlideshow();
            }, interval);

            /*
            TweenLite.killTweensOf(slideshowtime);
            slideshowtime = TweenLite.delayedCall(3.5, function () {
                navigate( 'next' );
                startSlideshow();
            });*/
        }

        return {
            init: init
        };

    })();
    $(function () {
        slider.init();
    });
}
