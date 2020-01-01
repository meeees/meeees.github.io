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