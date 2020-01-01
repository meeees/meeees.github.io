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