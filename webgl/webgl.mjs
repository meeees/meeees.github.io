import {initPrograms} from './shaders.mjs';
import {Voxel} from './voxels.mjs';
import {calcModelView, bindFloatBuffer} from './helpers.mjs';
import {InputManager} from './input.mjs';

var mat4 = glMatrix.mat4;

var canvas;
var gl;
var shaderInfo;
var buffers;
var screenBuffers;
var voxels;

var ghostVoxel;
var ghostVisible = false;
var targetedVoxel;
var newVoxelColor = [100, 100, 100, 255];

var cameraPos = [0.0, 0.0, 0.0 ];
var cameraRot = [0.0, 0.0, 0.0];
var cameraDist = 10.0;

var renderTextures;

function main() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl2', {alpha: false});

    if(gl === null) {
        const dContext = canvas.getContext('2d');
        dContext.fillText('Your browser no like webgl2, use better browser', 10, 10);
    }

    InputManager.initialize(canvas, addVoxel, removeVoxel, rotateCamera, zoomCamera);

    shaderInfo = initPrograms(gl);
    buffers = Voxel.initBuffers(gl);
    screenBuffers = initScreenBuffer(gl);

    voxels = [
        new Voxel(gl, 0.0, 0.0, 0, [255, 0, 0, 255]),
        new Voxel(gl, 0.0, -1.0, 0, [0, 255, 0, 255]),
        new Voxel(gl, -1.0, -1.0, 0, [0, 0, 255, 255]),
        new Voxel(gl, -1.0, 0.0, 0, [255, 255, 255, 255]),
    ];

    ghostVoxel = new Voxel(gl, 0, 0, 0, [255, 255, 255, 200], true);
    
    renderTextures = setupRenderTextures(gl);

    requestAnimationFrame(render);
}


function setupRenderTextures(gl) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    const width = gl.canvas.clientWidth;
    const height = gl.canvas.clientHeight;
    const mainTexture = gl.createTexture();
    const collisionTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, mainTexture);
    {
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height,
            border, format, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, mainTexture, level);
    }

    gl.bindTexture(gl.TEXTURE_2D, collisionTexture);
    {
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height,
            border, format, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        
        const attachmentPoint = gl.COLOR_ATTACHMENT1;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, collisionTexture, level);
    }

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

    const cfb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, cfb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, collisionTexture, 0);

    return {
        framebuffer: fb,
        collisionOnlyBuffer: cfb,
        mainTexture: mainTexture,
        collisionTexture: collisionTexture,
    };
}

function initScreenBuffer(gl) 
{
    const vertBuffer = gl.createBuffer();
    const verts = [
        1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return {
        screenVerts: vertBuffer,
    };
}


var curTime = 0;
function render(now) {
    now *= 0.001;
    const dt = now - curTime;
    curTime = now;
    drawScene(gl, shaderInfo.objectInfo, buffers, dt);
    drawScreen(gl, shaderInfo.screenInfo, screenBuffers, renderTextures.mainTexture);
    checkMouseOver(gl);
    /*var test = gl.getError();
    if(test != 0) 
    {
        console.log(test);
    }*/

    requestAnimationFrame(render);
}

function clearScreen(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function checkMouseOver(gl)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTextures.collisionOnlyBuffer);

    var x = InputManager.mouseX;
    var y = InputManager.mouseY;
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    var pixels = new Uint8Array(4);
    // we are off the screeen
    if (x < 0 || x >= width || y < 0 || y >= height)
    {

    }
    else
    {
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        if(pixels[0] != 0 || pixels[1] != 0 || pixels[2] != 0)
        {
            var voxelInfo = Voxel.getVoxelByCol(pixels);
            ghostVisible = true;
            var newPos = voxelInfo.targetedSpace;
            newPos = [newPos[0] + 0.05, newPos[1] + 0.05, newPos[2] + 0.05];
            ghostVoxel.pos = newPos;
            targetedVoxel = voxelInfo.voxel;
        }
        else {
            ghostVisible = false;
            targetedVoxel = null;
        }
    }

}

function getProjection(gl, fov) 
{
    const fieldOfView = fov * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
}

function getCameraMatrix(cameraPos, cameraRot)
{
    const cameraMatrix = calcModelView(cameraPos, cameraRot);
    mat4.invert(cameraMatrix, cameraMatrix);
    return cameraMatrix;
}

function drawScene(gl, programInfo, buffers, dt) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTextures.framebuffer);
    clearScreen(gl);
    //cameraRot[1] = 30;
    const phi = cameraRot[0] * Math.PI / 180;
    const theta = cameraRot[1] * Math.PI / 180;
    cameraPos[0] = cameraDist * Math.sin(theta) * Math.cos(phi);
    cameraPos[1] = -cameraDist * Math.sin(phi);
    cameraPos[2] = cameraDist * Math.cos(theta) * Math.cos(phi);

    //cameraPos[2] = cameraDist * Math.cos(cameraRot[1] * Math.PI / 180);
    //console.log(cameraPos);

    const projectionMatrix = getProjection(gl, 45);
    const cameraMatrix = getCameraMatrix(cameraPos, cameraRot);
    mat4.multiply(projectionMatrix, projectionMatrix, cameraMatrix);

    Voxel.setupVoxelDrawing(gl, programInfo, projectionMatrix, buffers);
    for(var i = 0; i < voxels.length; i++)
    {
        var v = voxels[i];
        v.drawVoxel(gl, programInfo);
    }
    if(ghostVisible)
    {
        ghostVoxel.drawVoxel(gl, programInfo);
    }
}

function drawScreen(gl, programInfo, buffers, texture)
{
    gl.useProgram(programInfo.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    bindFloatBuffer(gl, buffers.screenVerts, programInfo.attribLocations.vertexPosition, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function addVoxel()
{
    if(ghostVisible)
    {
        var toAdd = new Voxel(gl, ghostVoxel.pos[0] - 0.05, ghostVoxel.pos[1] - 0.05, ghostVoxel.pos[2] - 0.05, newVoxelColor);
        voxels.push(toAdd);
    }
}

function removeVoxel()
{
    if(targetedVoxel != null && voxels.length > 1)
    {
        for(var i = 0; i < voxels.length; i++)
        {
            if(voxels[i].voxelIndex == targetedVoxel.voxelIndex)
            {
                voxels.splice(i, 1);
                targetedVoxel.destroyVoxel();
                break;
            }
        }
    }
}

function rotateCamera(dx, dy)
{
    cameraRot[1] -= dx;
    cameraRot[0] -= dy;
}

function zoomCamera(delta)
{
    cameraDist += delta * 0.05;
    if(cameraDist < 2)
    {
        cameraDist = 2;
    }
    if(cameraDist > 100)
    {
        cameraDist = 100;
    }
}


export function run() {
    main();
}