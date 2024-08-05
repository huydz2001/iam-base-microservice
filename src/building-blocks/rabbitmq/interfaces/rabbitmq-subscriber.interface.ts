type handlerFunc<T> = (queue: string, message: T) => void;

export interface IRabbitmqConsumer {
  consumeMessage<T>(type: T, handler: handlerFunc<T>): Promise<void>;
  isConsumed<T>(message: T): Promise<boolean>;
}
