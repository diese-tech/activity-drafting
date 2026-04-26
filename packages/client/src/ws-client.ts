export type ServerMessage =
  | { type: 'state'; state: import('./types').StateSnapshot }
  | { type: 'export'; export: object }
  | { type: 'error'; message: string };

export type MessageHandler = (msg: ServerMessage) => void;

export class WsClient {
  private ws: WebSocket | null = null;
  private handler: MessageHandler;

  constructor(handler: MessageHandler) {
    this.handler = handler;
  }

  connect(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as ServerMessage;
        this.handler(msg);
      } catch {
        console.error('Failed to parse server message', ev.data);
      }
    };

    this.ws.onerror = (ev) => {
      console.error('WebSocket error', ev);
    };
  }

  send(payload: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}
