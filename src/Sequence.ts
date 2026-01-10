export class Sequence {
  private static _nextId = 0;

  static nextId(): number {
    return Sequence._nextId++;
  }
}
