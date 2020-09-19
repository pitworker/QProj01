// Only executed our code once the DOM is ready.
window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    // Create a rectangle shaped path with its top left point at
    // {x: 75, y: 75} and a size of {width: 75, height: 75}
    var path = new paper.Path.Rectangle({
        point: [75, 75],
        size: [75, 75],
        strokeColor: 'black'
    });

    paper.view.onFrame = function(event) {
        // Each frame, rotate the path by 3 degrees:
        path.rotate(3);
    }

    paper.view.draw();
}
