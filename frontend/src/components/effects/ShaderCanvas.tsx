import { useEffect, useRef } from "react";

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(
      vertexShader,
      `attribute vec2 position;
       void main() { gl_Position = vec4(position, 0.0, 1.0); }`
    );
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(
      fragmentShader,
      `precision highp float;
       uniform vec2 iResolution;
       uniform float iTime;
       uniform vec2 iMouse;

       void main() {
         vec2 uv = gl_FragCoord.xy / iResolution;
         vec2 p = (gl_FragCoord.xy * 2.0 - iResolution) / min(iResolution.x, iResolution.y);

         vec3 color = vec3(0.0588, 0.0902, 0.1647);

         vec3 orb1 = vec3(0.486, 0.227, 0.929);
         vec3 orb2 = vec3(0.302, 0.141, 0.580);
         vec3 orb3 = vec3(0.416, 0.196, 0.800);

         vec2 o1 = vec2(sin(iTime * 0.15) * 2.0, cos(iTime * 0.2) * 1.5);
         vec2 o2 = vec2(sin(iTime * 0.12 + 2.0) * 2.5, cos(iTime * 0.18 + 1.0) * 2.0);
         vec2 o3 = vec2(sin(iTime * 0.1 + 4.0) * 1.8, cos(iTime * 0.15 + 3.0) * 1.8);

         float d1 = length(p - o1);
         float d2 = length(p - o2);
         float d3 = length(p - o3);

         float f1 = 0.08 / d1;
         float f2 = 0.06 / d2;
         float f3 = 0.05 / d3;

         vec3 finalColor = color;
         finalColor += orb1 * f1;
         finalColor += orb2 * f2;
         finalColor += orb3 * f3;

         float grid = max(0.0, 1.0 - abs(fract(p.x * 10.0) - 0.5) * 8.0);
         grid *= max(0.0, 1.0 - abs(fract(p.y * 10.0) - 0.5) * 8.0);
         finalColor += vec3(0.05) * grid;

         float vignette = 1.0 - length(uv - 0.5) * 0.5;
         finalColor *= vignette;

         gl_FragColor = vec4(finalColor, 1.0);
       }`
    );
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const iResolution = gl.getUniformLocation(program, "iResolution");
    const iTime = gl.getUniformLocation(program, "iTime");
    const iMouse = gl.getUniformLocation(program, "iMouse");

    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = canvas.height - e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    let startTime = performance.now();
    const render = () => {
      const time = (performance.now() - startTime) / 1000;
      gl.uniform2f(iResolution, canvas.width, canvas.height);
      gl.uniform1f(iTime, time);
      gl.uniform2f(iMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
