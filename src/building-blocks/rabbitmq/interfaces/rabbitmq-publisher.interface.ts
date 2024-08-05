export interface IRabbitmqPublisher {
  publishMessage<T>(message: T): Promise<void>;
  isPublished<T>(message: T): Promise<boolean>;
}
