const vertShader = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec3 vLighting;
    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
        vTextureCoord = aTextureCoord;
    }
`;

const fragShader = `
    #extension GL_EXT_draw_buffers : require 
    varying highp vec3 vLighting;
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragData[0] = texture2D(uSampler, vTextureCoord) * vec4(vLighting, 1.0);
        gl_FragData[1] = texture2D(uSampler, vTextureCoord);
    }
`;

const screenVertShader = `
    attribute vec2 aVertexPosition;
    varying highp vec2 vTextureCoord;

    void main() {
        vTextureCoord = aVertexPosition * vec2(0.5, 0.5) + vec2(0.5, 0.5);
        gl_Position = vec4(aVertexPosition, 0, 1);
    }
`

const screenFragShader = `
    uniform sampler2D uSampler;
    varying highp vec2 vTextureCoord;

    void main() {
        gl_FragData[0] = texture2D(uSampler, vTextureCoord);
    }
`

export function initPrograms(gl) {
    const shaderProgram = initShaders(gl, vertShader, fragShader);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexTextureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };
    const screenShaderProgram = initShaders(gl, screenVertShader, screenFragShader);
    const screenProgramInfo = {
        program: screenShaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(screenShaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            uSampler: gl.getUniformLocation(screenShaderProgram, 'uSampler'),
        }        
    }
    return {
        objectInfo: programInfo,
        screenInfo: screenProgramInfo,
    } 
}
function initShaders(gl, vShader, fShader) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShader);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occured compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}