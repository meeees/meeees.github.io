import {bindFloatBuffer, makeColorTexture, 
    calcModelView, calcNormalMatrix,
     rgbaToArray, arrayToRGBA}
     from './helpers.mjs';

var voxelCount = 0;

class Voxel {

    static voxelMap = {}
    // maps to the block in front of the indexed face
    // front, back, top, bottom, right, left
    static faceMappings = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];

    // optionally be a ghost voxel, will stop the voxel from being put into the map for collision
    constructor(gl, x, y, z, col, ghost=false) {
        this.pos = [x, y, z];
        this.texture = makeColorTexture(gl, new Uint8Array(col));
        this.ghost = ghost;
        if(!this.ghost)
        {
            this.voxelIndex = voxelCount;
            Voxel.voxelMap[this.voxelIndex] = this;
            voxelCount += 1;
    
            const baseCol = 1 + this.voxelIndex * 6;
            const faceCols = [baseCol, baseCol + 1, baseCol + 2, baseCol + 3, baseCol + 4, baseCol + 5];
            var faceColArray = [];
            for(var i = 0; i < faceCols.length; i++)
            {
                var val = rgbaToArray(faceCols[i]);
                val[3] = 1.0;
                faceColArray = faceColArray.concat(val, val, val, val);
            }
        }
        else 
        {
            this.voxelIndex = -1;
            const baseCol = 1;
            const faceCols = [baseCol, baseCol + 1, baseCol + 2, baseCol + 3, baseCol + 4, baseCol + 5];
            var faceColArray = [];
            for(var i = 0; i < faceCols.length; i++)
            {
                var val = rgbaToArray(faceCols[i]);
                val[3] = 0.0;
                faceColArray = faceColArray.concat(val, val, val, val);
            }
        }


        const faceColBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, faceColBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceColArray), gl.STATIC_DRAW);
        this.faceColors = faceColBuffer;
    }

    drawVoxel(gl, programInfo)
    {
        var modelViewMatrix;
        // shrink ghost view a little so it doesn't clip
        if(!this.ghost) 
        {
            modelViewMatrix = calcModelView(this.pos, [0, 0, 0]);
        } 
        else
        {
            modelViewMatrix = calcModelView(this.pos, [0, 0, 0], [0.9, 0.9, 0.9]);
        }
        const normalMatrix = calcNormalMatrix(modelViewMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        bindFloatBuffer(gl, this.faceColors, programInfo.attribLocations.faceColor, 4);
        {
            const offset = 0;
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    }

    destroyVoxel()
    {
        delete Voxel.voxelMap[this.voxelIndex];
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

    static getVoxelByCol(rgba)
    {
        // zero out the alpha channel
        rgba[3] = 0;
        const val = arrayToRGBA(rgba) - 1;
        if(val == -1)
        {
            return null;
        }
        const index = Math.trunc(val / 6);
        const face = val % 6;
        const voxel = Voxel.voxelMap[index];
        const targeted = Voxel.faceMappings[face];
        return {
            voxel: voxel,
            face: face,
            targetedSpace: [voxel.pos[0] + targeted[0], voxel.pos[1] + targeted[1], voxel.pos[2] + targeted[2]],
        }
    }
}

export {Voxel}