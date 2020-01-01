import {bindFloatBuffer, makeColorTexture, calcModelView, calcNormalMatrix} from './helpers.mjs';

class Voxel {

    constructor(gl, x, y, z, col) {
        this.pos = [x, y, z];
        this.texture = makeColorTexture(gl, new Uint8Array(col));
    }

    drawVoxel(gl, programInfo)
    {
        const modelViewMatrix = calcModelView(this.pos, [0, 0, 0]);
        const normalMatrix = calcNormalMatrix(modelViewMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        {
            const offset = 0;
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    }
    static setupVoxelDrawing(gl, programInfo, projectionMatrix, buffers)
    {
        gl.useProgram(programInfo.program);

        bindFloatBuffer(gl, buffers.position, programInfo.attribLocations.vertexPosition, 3);
        bindFloatBuffer(gl, buffers.normal, programInfo.attribLocations.vertexNormal, 3);
        bindFloatBuffer(gl, buffers.textureCoord, programInfo.attribLocations.vertexTextureCoord, 2);

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    }
    static initBuffers(gl) {

        const positionBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();
        const normalBuffer = gl.createBuffer();
        const textureBuffer = gl.createBuffer();

        const positions = [
            // Front face
            0.0, 0.0,  1.0,
            1.0, 0.0,  1.0,
            1.0,  1.0,  1.0,
            0.0,  1.0,  1.0,
            
            // Back face
            0.0, 0.0, 0.0,
            0.0,  1.0, 0.0,
            1.0,  1.0, 0.0,
            1.0, 0.0, 0.0,
            
            // Top face
            0.0,  1.0, 0.0,
            0.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, 0.0,
            
            // Bottom face
            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0,  1.0,
            0.0, 0.0,  1.0,
            
            // Right face
            1.0, 0.0, 0.0,
            1.0,  1.0, 0.0,
            1.0,  1.0,  1.0,
            1.0, 0.0,  1.0,
            
            // Left face
            0.0, 0.0, 0.0,
            0.0, 0.0,  1.0,
            0.0,  1.0,  1.0,
            0.0,  1.0, 0.0,
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

        const indices = [
            0, 1, 2,    0, 2, 3, // front 
            4, 5, 6,    4, 6, 7, // back
            8, 9, 10,   8, 10, 11, // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23, // left
        ];

        var textureCoords = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];

        textureCoords = textureCoords.concat(textureCoords, textureCoords, textureCoords, textureCoords, textureCoords);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            indices: indexBuffer,
            normal: normalBuffer,
            textureCoord: textureBuffer,
        };
    }
}

export {Voxel}