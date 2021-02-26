class Options {
  unit = 's';

  constructor (unit = 's') {
    this.unit = unit
  }

  static Serialize (options: Options): string {
    return JSON.stringify(options)
  }

  static Deserialize (text: string): Options {
    const data = JSON.parse(text)
    return new Options(data.unit)
  }
}

export {
  Options
}
