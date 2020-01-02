var mat4 = glMatrix.mat4;

export function bindFloatBuffer(gl, buffer, target, numComponents) 
{
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(target, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(target);
}

export function makeColorTexture(gl, color)
{
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType, color);
    return texture;
}

export function calcModelView(position, rotation, scale=[1, 1, 1])
{
    const modelViewMatrix = mat4.create();
    const modelRotation = glMatrix.quat.create();
    glMatrix.quat.fromEuler(modelRotation, rotation[0], rotation[1], rotation[2]);
    mat4.fromRotationTranslationScale(modelViewMatrix, modelRotation, position, scale);
    return modelViewMatrix;
}

export function calcNormalMatrix(modelView) 
{
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelView);
    mat4.transpose(normalMatrix, normalMatrix);
    return normalMatrix;
}

export function rgbaToArray(val) 
{
    return [
        (val & 0xff) / 255.0,
        (val >> 8 & 0xff) / 255.0,
        (val >> 16 & 0xff) / 255.0,
        (val >> 24 & 0xff) / 255.0,
    ];
}

export function arrayToRGBA(arr)
{
    return Math.round(arr[0]) | 
        (Math.round(arr[1]) << 8) |
        (Math.round(arr[2]) << 16) |
        (Math.round(arr[3]) << 24);
}