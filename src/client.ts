import { isServerDraw, isServerInitState } from "./shared";

interface Line {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

(async () => {
  const socket = new WebSocket("ws://localhost:8080");

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  document.oncontextmenu = function () {
    return false;
  };
  const drawings: Line[] = [];

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (isServerDraw(message)) {
      drawings.push({
        x0: message.x0,
        y0: message.y0,
        x1: message.x1,
        y1: message.y1,
      });
    }

    if (isServerInitState(message)) {
      drawings.push(
        ...message.drawings.map((draw) => ({
          x0: draw.x0,
          y0: draw.y0,
          x1: draw.x1,
          y1: draw.y1,
        }))
      );
    }

    redrawCanvas(canvas, context);
  };

  function drawLine(
    context: CanvasRenderingContext2D,
    { x0, x1, y0, y1 }: Line
  ) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
  }

  function redrawCanvas(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const draw of drawings) {
      drawLine(context, {
        x0: draw.x0,
        x1: draw.x1,
        y0: draw.y0,
        y1: draw.y1,
      });
    }
  }
  redrawCanvas(canvas, context);

  window.addEventListener("resize", (event) => {
    redrawCanvas(canvas, context);
  });

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  let leftMouseDown = false;

  let cursorX: number;
  let cursorY: number;
  let prevCursorX: number;
  let prevCursorY: number;

  function onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      leftMouseDown = true;

      cursorX = event.pageX;
      cursorY = event.pageY;
      prevCursorX = event.pageX;
      prevCursorY = event.pageY;
    }
  }

  function onMouseUp(event: MouseEvent) {
    leftMouseDown = false;
  }

  function onMouseMove(event: MouseEvent) {
    if (leftMouseDown) {
      cursorX = event.pageX;
      cursorY = event.pageY;
      const scaledX = cursorX;
      const scaledY = cursorY;
      const prevScaledX = prevCursorX;
      const prevScaledY = prevCursorY;

      drawings.push({
        x0: prevScaledX,
        y0: prevScaledY,
        x1: scaledX,
        y1: scaledY,
      });

      redrawCanvas(canvas, context);

      socket.send(
        JSON.stringify({
          kind: "draw",
          x0: prevScaledX,
          y0: prevScaledY,
          x1: scaledX,
          y1: scaledY,
        })
      );

      prevCursorX = cursorX;
      prevCursorY = cursorY;
    }
  }
})();
