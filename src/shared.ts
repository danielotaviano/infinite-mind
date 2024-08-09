interface ServerDraw {
  kind: "draw";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function isServerDraw(message: any): message is ServerDraw {
  return message.kind === "draw";
}
interface ServerInitState {
  kind: "state";
  drawings: ServerDraw[];
}

function isServerInitState(message: any): message is ServerInitState {
  return message.kind === "state";
}

export { ServerDraw, isServerDraw, ServerInitState, isServerInitState };
