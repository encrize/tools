document.querySelector('[data-split-event="1"]').addEventListener('load', function(event) {
    const splitEventResult = (function(event) {this.media='all'}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
