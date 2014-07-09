define(['c'], function () {
    var WIN = window,
        DOC = WIN.document,
        SCROLL_ACCURACY = 1000, //1000 ms
        SCROLL_EVENT = 'scroll',
        SCROLL_STATUS = {
            START: 0,
            SCROLLING: 1,
            END: 2
        },
        SCROLL_EVENTS = {
            START: 'customScrollStart',
            END: 'customScrollEnd'
        },
        lastX = 0,
        lastY = 0,
        timer = null,
        observer;

    WIN = $(WIN);

    function scrollDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down');
    };
    function updateStatus() {
        var self = this,
            body = DOC.body,
            currentX = body.scrollLeft,
            currentY = body.scrollTop;

        if (this.status == SCROLL_STATUS.START) {
            this.status = SCROLL_STATUS.BEGIN;
            this.direction = scrollDirection(lastX, currentX, lastY, currentY);
            WIN.trigger(SCROLL_EVENTS.START, {
                direction: self.direction, 
                y: currentY, 
                x: currentX
            });
        } else {
            this.status = SCROLL_STATUS.SCROLLING;
        };
        clearTimeout(timer);
        timer = setTimeout(function () {
            self.status = SCROLL_STATUS.START;
            WIN.trigger(SCROLL_EVENTS.END, {
                direction: self.direction,
                y: currentY,
                x: currentX
            });
            lastY = body.scrollTop;
            lastX = body.scrollLeft;
        }, SCROLL_ACCURACY);
    };
    function scrollHandler(e) {
        var body = DOC.body,
        x = body.scrollLeft,
        y = body.scrollTop;

        updateStatus();
        //trigger('')
    };
    observer = {
        init: function (options) {
            this.status = SCROLL_STATUS.END;
            this.__scrollHandler = $.proxy(scrollHandler, this);
            return this;
        },
        enable: function () {
            WIN.on(SCROLL_EVENT, this.__scrollHandler);
        },
        disable: function () {
            WIN.off(SCROLL_EVENT, this.__scrollHandler);
        }
    };

    return observer;
});
//test code
/*
observer.init().enable();
$(window).on('customScrollStart', function () {
console.log(arguments);
})
$('body').on('click', function () {
observer.disable();
})
*/
