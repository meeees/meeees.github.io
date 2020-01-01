import {initProgram} from './shaders.mjs';
import {bindFloatBuffer} from './helpers.mjs';

var mat4 = glMatrix.mat4;

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();

    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    var colors = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
    ];

    const normals = [
        // Front
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
    
        // Back
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
    
        // Top
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
    
        // Bottom
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
    
        // Right
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
    
        // Left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
      ];

    colors = colors.concat(colors, colors, colors, colors, colors, colors);

    const indices = [
        0, 1, 2,    0, 2, 3, // front 
        4, 5, 6,    4, 6, 7, // back
        8, 9, 10,   8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ]

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
         new Float32Array(positions),
         gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        normal: normalBuffer,
    };
}

var canvas;
var gl;
var shaderInfo;
var buffers;

function main() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl');

    if(gl === null) {
        const dContext = canvas.getContext('2d');
        dContext.fillText('Your browser no like webgl, use better browser', 10, 10);
    }

    shaderInfo = initProgram(gl);
    buffers = initBuffers(gl);
    requestAnimationFrame(render);
}

var curTime = 0;
function render(now) {
    now *= 0.001;
    const dt = now - curTime;
    curTime = now;
    drawScene(gl, shaderInfo, buffers, dt);

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

var rotation = 0.0; 
function drawScene(gl, programInfo, buffers, dt) {
    
    clearScreen(gl);
    const projectionMatrix = getProjection(gl, 45);

    rotation += dt;
    const cube1Matrix = calcModelView([0.0, 0.0, -13.0], [rotation * 0.7, rotation * 0.7, 0]);
    const cube2Matrix = calcModelView([3.5, 0.0, -13.0], [rotation * 0.7, -rotation * 0.7, 0]);
    const cube3Matrix = calcModelView([-3.5, 0.0, -13.0], [-rotation * 0.7, rotation * 0.7, 0]);
    const cube4Matrix = calcModelView([0.0, 3.5, -13.0], [rotation * 0.7, -rotation * 0.7, 0]);
    const cube5Matrix = calcModelView([3.5, 3.5, -13.0], [-rotation * 0.7, rotation * 0.7, 0]);
    const cube6Matrix = calcModelView([-3.5, 3.5, -13.0], [rotation * 0.7, rotation * 0.7, 0]);
    const cube7Matrix = calcModelView([0.0, -3.5, -13.0], [-rotation * 0.7, rotation * 0.7, 0]);
    const cube8Matrix = calcModelView([3.5, -3.5, -13.0], [rotation * 0.7, rotation * 0.7, 0]);
    const cube9Matrix = calcModelView([-3.5, -3.5, -13.0], [rotation * 0.7, -rotation * 0.7, 0]);
   
    drawCube(gl, projectionMatrix, cube1Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube2Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube3Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube4Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube5Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube6Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube7Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube8Matrix, programInfo, buffers);
    drawCube(gl, projectionMatrix, cube9Matrix, programInfo, buffers);
}

function calcModelView(position, rotation)
{
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, position);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[0], [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[1], [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[2], [0, 0, 1]);
    return modelViewMatrix;
}

function drawCube(gl, projectionMatrix, modelViewMatrix, programInfo, buffers)
{
    bindFloatBuffer(gl, buffers.position, programInfo.attribLocations.vertexPosition, 3);
    bindFloatBuffer(gl, buffers.color, programInfo.attribLocations.vertexColor, 4);
    bindFloatBuffer(gl, buffers.normal, programInfo.attribLocations.vertexNormal, 3);

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
         false, projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
         false, modelViewMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false, normalMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    { 
        const offset = 0;
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

export function run() {
    main();
}