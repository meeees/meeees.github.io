class InputManager {

    static mouseX = 0;
    static mouseY = 0;
    static middleDown;
    static initialize(canvas, callbacks)
    {
        InputManager.mouseX = 0;
        InputManager.mouseY = 0;
        canvas.addEventListener('mousemove', function(evt) {
            var mousePos = InputManager.getMousePos(canvas, evt);
            InputManager.mouseX = mousePos.x;
            InputManager.mouseY = mousePos.y;
            if(InputManager.middleDown)
            {
                callbacks.cameraCallback(evt.movementX, evt.movementY);
            }
            //console.log(mousePos);
        });
        canvas.addEventListener('mousedown', function(evt) {
            if(evt.button == 0)
            {
                if(evt.ctrlKey)
                {
                    callbacks.colorPickCallback();
                }
                else if(evt.altKey)
                {
                    callbacks.removeCallback();
                }
                else
                {
                    callbacks.addCallback();
                }
            }
            else if(evt.button == 1){
                InputManager.middleDown = true;
            }
        });
        canvas.addEventListener('mouseup', function(evt) {
            if(evt.button == 1)
            {
                InputManager.middleDown = false;
            }
        });
        canvas.addEventListener('wheel', function(evt) {
            callbacks.zoomCallback(evt.deltaY);
        })
    }

    static getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: rect.height - (evt.clientY - rect.top)
        };
    }
}

export {InputManager}