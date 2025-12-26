// Sensor that never activates (empty activators array)
// Used when keyboard navigation is disabled to fully prevent Space/Arrow key activation
export class NoopKeyboardSensor {
  static activators = [];
  autoScrollEnabled = false;

  constructor(_props: unknown) {
    // Minimal no-op sensor implementation
  }

  static setup() {
    // No setup needed
    return undefined;
  }
}
