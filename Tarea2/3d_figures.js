mat4 = glMatrix.mat4;

var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.

function createPyramid(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        -3.5, 0, 0,
        -1.5, 0, 0,
        -0.88, 0, 1.9,
        -2.5, 0, 3.08,
        -4.12, 0, 1.9,

        -3.5, 0, 0,
        -1.5, 0, 0,
        -2.46, 3.84, 1.34,

        -1.5, 0, 0,
        -0.88, 0, 1.9,
        -2.46, 3.84, 1.34,

        -0.88, 0, 1.9,
        -2.5, 0, 3.08,
        -2.46, 3.84, 1.34,

        -2.5, 0, 3.08,
        -4.12, 0, 1.9,
        -2.46, 3.84, 1.34,

        -4.12, 0, 1.9,
        -3.5, 0, 0,
        -2.46, 3.84, 1.34,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],

    ];

    let vertexColors = [];

    let contador = false;
    faceColors.forEach(color => {
        if (contador == 0) {
            for (let j = 0; j < 5; j++)
                vertexColors.push(...color);
            contador = true;
        } else {
            for (let j = 0; j < 3; j++)
                vertexColors.push(...color);
        }
    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 4, 4, 1, 2, 4, 2, 3,
        5, 6, 7,
        8, 9, 10,
        11, 12, 13,
        14, 15, 16,
        17, 18, 19
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: pyramidIndexBuffer,
        vertSize: 3, nVerts: 60, colorSize: 4, nColors: 60, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createDod(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        -3.5, 0, 0,
        -1.5, 0, 0,
        -0.88, 1.9, 0,
        -2.5, 3.08, 0,
        -4.12, 1.9, 0,

        -3.5, 0, 0,
        -1.5, 0, 0,
        -4.12, -0.85, 1.7,
        -0.88, -0.85, 1.7,
        -2.5, -1.38, 2.75,

        -1.5, 0, 0,
        -0.88, 1.9, 0,
        -0.88, -0.85, 1.7,
        0.12, 2.23, 1.7,
        0.12, 0.53, 2.75,

        -0.88, 1.9, 0,
        -2.5, 3.08, 0,
        0.12, 2.23, 1.7,
        -2.5, 4.13, 1.7,
        -0.88, 3.6, 2.75,

        -2.5, 3.08, 0,
        -4.12, 1.9, 0,
        -2.5, 4.13, 1.7,
        -5.12, 2.23, 1.7,
        -4.12, 3.6, 2.75,

        -4.12, 1.9, 0,
        -3.5, 0, 0,
        -5.12, 2.23, 1.7,
        -4.12, -0.85, 1.7,
        -5.12, 0.53, 2.75,

        -4.12, -0.85, 1.7,
        -5.12, 0.53, 2.75,
        -2.5, -1.38, 2.75,
        -4.12, 0.85, 4.45,
        -2.5, -0.32, 4.45,

        -0.88, -0.85, 1.7,
        -2.5, -1.38, 2.75,
        0.12, 0.53, 2.75,
        -2.5, -0.32, 4.45,
        -0.88, 0.85, 4.45,

        0.12, 2.23, 1.7,
        0.12, 0.53, 2.75,
        -0.88, 3.6, 2.75,
        -0.88, 0.85, 4.45,
        -1.5, 2.75, 4.45,

        -2.5, 4.13, 1.7,
        -0.88, 3.6, 2.75,
        -4.12, 3.6, 2.75,
        -1.5, 2.75, 4.45,
        -3.5, 2.75, 4.45,

        -5.12, 2.23, 1.7,
        -4.12, 3.6, 2.75,
        -5.12, 0.53, 2.75,
        -3.5, 2.75, 4.45,
        -4.12, 0.85, 4.45,

        -3.5, 2.75, 4.45,
        -4.12, 0.85, 4.45,
        -1.5, 2.75, 4.45,
        -2.5, -0.32, 4.45,
        -0.88, 0.85, 4.45
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.5, 0.0, 0.0, 1.0],
        [0.5, 0.5, 0.0, 1.0],
        [0.5, 0.5, 0.5, 1.0],
        [0.5, 0.0, 0.5, 1.0],
        [0.1, 0.5, 0.0, 1.0],
        [0.1, 0.5, 0.5, 1.0],
    ];

    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++)
            vertexColors.push(...color);
    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodIndexBuffer);

    let dodIndices = [
        0, 1, 2, 0, 2, 3, 0, 3, 4,
        5, 6, 7, 6, 7, 8, 7, 8, 9,
        10, 11, 12, 11, 12, 13, 12, 13, 14,
        15, 16, 17, 16, 17, 18, 17, 18, 19,
        20, 21, 22, 21, 22, 23, 22, 23, 24,
        25, 26, 27, 26, 27, 28, 27, 28, 29,
        30, 31, 32, 31, 32, 33, 32, 33, 34,
        35, 36, 37, 36, 37, 38, 37, 38, 39,
        40, 41, 42, 41, 42, 43, 42, 43, 44,
        45, 46, 47, 46, 47, 48, 47, 48, 49,
        50, 51, 52, 51, 52, 53, 52, 53, 54,
        55, 56, 57, 56, 57, 58, 57, 58, 59
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodIndices), gl.STATIC_DRAW);

    let dod = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: dodIndexBuffer,
        vertSize: 3, nVerts: 180, colorSize: 4, nColors: 180, nIndices: 108,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(dod.modelViewMatrix, dod.modelViewMatrix, translation);

    dod.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis[0]);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis[1]);
    };

    return dod;
}

function createOct(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        4.53, 3.06, 0.0,
        2.0, 5.0, 0.0,
        1.58, 1.84, 0.0,

        2.0, 5.0, 0.0,
        0.88, 3.54, 2.6,
        1.58, 1.84, 0.0,

        0.88, 3.54, 2.6,
        3.4, 1.6, 2.6,
        1.58, 1.84, 0.0,

        3.4, 1.6, 2.6,
        4.53, 3.06, 0.0,
        1.58, 1.84, 0.0,

        4.53, 3.06, 0.0,
        2.0, 5.0, 0.0,
        3.82, 4.76, 2.6,

        2.0, 5.0, 0.0,
        0.88, 3.54, 2.6,
        3.82, 4.76, 2.6,

        0.88, 3.54, 2.6,
        3.4, 1.6, 2.6,
        3.82, 4.76, 2.6,

        3.4, 1.6, 2.6,
        4.53, 3.06, 0.0,
        3.82, 4.76, 2.6
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 0.5, 0.0, 1.0],
        [1.0, 1.0, 0.5, 1.0],
        [0.05, 0.5, 0.5, 1.0],
        [1.0, 0.5, 1.0, 1.0]
    ];

    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    })

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octIndexBuffer);

    let octIndices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octIndices), gl.STATIC_DRAW);

    let oct = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: octIndexBuffer,
        vertSize: 3, nVerts: 72, colorSize: 4, nColors: 72, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(oct.modelViewMatrix, oct.modelViewMatrix, translation);

    var isUp = false;

    oct.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        console.log(this.modelViewMatrix[13]);

        if (this.modelViewMatrix[13] <= 0 && !isUp) {
            this.modelViewMatrix[13] += 0.05;
        } else {
            if (this.modelViewMatrix[13] >= 0 && !isUp) {
                isUp = true;
            }
            if (this.modelViewMatrix[13] >= -8 && isUp) {
                this.modelViewMatrix[13] -= 0.05;
            } else {
                isUp = false;
            }
        }

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return oct;
}

function createShader(gl, str, type) {
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function () { run(gl, objs); });
    draw(gl, objs);

    for (i = 0; i < objs.length; i++)
        objs[i].update();
}
