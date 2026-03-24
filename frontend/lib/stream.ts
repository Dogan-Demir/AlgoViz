import { API_BASE_URL } from './constants';
import type { Step } from './types';

interface StreamCallbacks {
  onStep: (step: Step) => void;
  onComplete: (data: { totalSteps: number; finalState: unknown }) => void;
  onError: (error: { code: string; message: string }) => void;
}

export class AlgorithmStreamClient {
  private eventSource: EventSource | null = null;
  private runId: string;
  private callbacks: StreamCallbacks;

  constructor(runId: string, callbacks: StreamCallbacks) {
    this.runId = runId;
    this.callbacks = callbacks;
  }

  connect(): void {
    const url = `${API_BASE_URL}/api/runs/${this.runId}/stream`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('step', (event: MessageEvent) => {
      try {
        const step: Step = JSON.parse(event.data);
        this.callbacks.onStep(step);
      } catch (e) {
        console.error('Failed to parse step:', e);
      }
    });

    this.eventSource.addEventListener('complete', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.callbacks.onComplete(data);
        this.disconnect();
      } catch (e) {
        console.error('Failed to parse complete event:', e);
      }
    });

    this.eventSource.addEventListener('error', (event: Event) => {
      const messageEvent = event as MessageEvent;
      if (messageEvent.data) {
        try {
          const error = JSON.parse(messageEvent.data);
          this.callbacks.onError(error);
        } catch (e) {
          this.callbacks.onError({ code: 'UNKNOWN', message: 'Stream error' });
        }
      }
      this.disconnect();
    });

    this.eventSource.onerror = () => {
      // Connection error (different from error event)
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.callbacks.onError({
          code: 'CONNECTION_CLOSED',
          message: 'Connection lost',
        });
      }
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}
