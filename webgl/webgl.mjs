import {initPrograms} from './shaders.mjs';
import {Voxel} from './voxels.mjs';
import {calcModelView, bindFloatBuffer} from './helpers.mjs';

var mat4 = glMatrix.mat4;

var canvas;
var gl;
var shaderInfo;
var buffers;
var screenBuffers;
var voxels;

var cameraPos = [0.0, 0.0, 6.0 ];
var cameraRot = [0.0, 0.0, 0.0];

var bufferExt;
var renderTextures;

function main() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl');

    if(gl === null) {
        const dContext = canvas.getContext('2d');
        dContext.fillText('Your browser no like webgl, use better browser', 10, 10);
    }

    bufferExt = gl.getExtension('WEBGL_draw_buffers');

    shaderInfo = initPrograms(gl);
    buffers = Voxel.initBuffers(gl);
    screenBuffers = initScreenBuffer(gl);

    voxels = [
        new Voxel(gl, 0.0, 0.0, 0, [255, 0, 0, 255]),
        new Voxel(gl, 0.0, -1.0, 0, [0, 255, 0, 255]),
        new Voxel(gl, -1.0, -1.0, 0, [0, 0, 255, 255]),
        new Voxel(gl, -1.0, 0.0, 0, [255, 255, 255, 255]),
    ];
    
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


        
        const attachmentPoint = bufferExt.COLOR_ATTACHMENT0_WEBGL;
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


        
        const attachmentPoint = bufferExt.COLOR_ATTACHMENT1_WEBGL;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, collisionTexture, level);
    }

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    bufferExt.drawBuffersWEBGL([bufferExt.COLOR_ATTACHMENT0_WEBGL, 
        bufferExt.COLOR_ATTACHMENT1_WEBGL]);

    return {
        framebuffer: fb,
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
    var test = gl.getError();
    if(test != 0) 
    {
        console.log(test);
    }

    requestAnimationFrame(render);
}

function clearScreen(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    cameraRot[1] += dt * 180 / Math.PI;
    const cameraDist = 10.0;
    cameraPos[0] = cameraDist * Math.sin(cameraRot[1] * Math.PI / 180);
    cameraPos[2] = cameraDist * Math.cos(cameraRot[1] * Math.PI / 180);
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


export function run() {
    main();
}